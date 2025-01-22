import axios, { AxiosError, AxiosResponse, AxiosInstance } from "axios";
import Router from "next/router";
import { API_CONSTANTS, ApiError } from "@/types/errors";
import {
  CustomRequestConfig,
  CustomInternalRequestConfig,
} from "@/types/axios";
import { AuthenticationResponse } from "@/types";
import { useErrorStore } from "@/store/errorStore";
import { createErrorObjectCustomInternalRequestConfig } from "./errorUtil";

// Constants
const API_CONFIG: CustomRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  retry: 3,
  retryDelay: 1000,
} as const;

// Improved token management
class TokenManager {
  private static readonly TOKEN_CONFIG = {
    path: "/",
    secure: true,
    sameSite: "strict",
    httpOnly: true,
  } as const;

  private static readonly COOKIES = {
    ACCESS: "accessToken",
    REFRESH: "refreshToken",
  } as const;

  // Using a more robust cookie parsing approach
  private static parseCookie(name: string): string | undefined {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`))
      ?.split("=")[1];
  }

  static getAccessToken(): string | undefined {
    return this.parseCookie(this.COOKIES.ACCESS);
  }

  static getRefreshToken(): string | undefined {
    return this.parseCookie(this.COOKIES.REFRESH);
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    const options = Object.entries(this.TOKEN_CONFIG)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");

    document.cookie = `${this.COOKIES.ACCESS}=${accessToken}; ${options}`;
    document.cookie = `${this.COOKIES.REFRESH}=${refreshToken}; ${options}`;
  }

  static clearTokens(): void {
    const expires = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    const options = `path=/; ${expires}`;

    document.cookie = `${this.COOKIES.ACCESS}=; ${options}`;
    document.cookie = `${this.COOKIES.REFRESH}=; ${options}`;
  }
}

// Request queue for handling concurrent requests during token refresh
class RequestQueue {
  private queue: Array<{
    resolve: (value: unknown) => void;
    reject: (error: unknown) => void;
  }> = [];
  private isRefreshing = false;

  async add(): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.queue.push({ resolve, reject });
    });
  }

  resolveAll(value: unknown) {
    this.queue.forEach(({ resolve }) => resolve(value));
    this.clearQueue();
  }

  rejectAll(error: unknown) {
    this.queue.forEach(({ reject }) => reject(error));
    this.clearQueue();
  }
  private clearQueue(): void {
    this.queue = [];
  }

  setRefreshing(value: boolean) {
    this.isRefreshing = value;
  }

  isCurrentlyRefreshing() {
    return this.isRefreshing;
  }
}

const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create(API_CONFIG);
  const requestQueue = new RequestQueue();

  instance.interceptors.request.use(
    (config: CustomInternalRequestConfig) => {
      const accessToken = TokenManager.getAccessToken();
      const isPublicRoute = API_CONSTANTS.PUBLIC_ROUTES.some((route) =>
        config.url?.includes(route)
      );
      config.metadata = {
        startTime: new Date(),
        retryCount: config._retryCount || 0,
      };

      if (accessToken && !isPublicRoute && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      config.metadata = { startTime: new Date() };

      return config;
    },
    (error: unknown) => {
      return updateErrorStore(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      updateRequestMetadata(response.config as CustomInternalRequestConfig);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomInternalRequestConfig;
      updateRequestMetadata(originalRequest);

      if (shouldRefreshToken(error))
        return handleTokenRefresh(instance, originalRequest, requestQueue);

      if (shouldRetryRequest(error, originalRequest))
        return handleRetry(instance, originalRequest);

      return updateErrorStore(error, originalRequest);
    }
  );
  return instance;
};

async function handleTokenRefresh(
  instance: AxiosInstance,
  originalRequest: CustomInternalRequestConfig,
  requestQueue: RequestQueue
): Promise<AxiosResponse> {
  try {
    if (requestQueue.isCurrentlyRefreshing()) {
      const token = await requestQueue.add();
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return instance(originalRequest);
    }
    requestQueue.setRefreshing(true);
    originalRequest._retry = true;

    const response = await refreshToken(instance);

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    TokenManager.setTokens(accessToken, newRefreshToken);

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;

    requestQueue.resolveAll(accessToken);
    return instance(originalRequest);
  } catch (error) {
    requestQueue.rejectAll(error);
    TokenManager.clearTokens();
    Router.push("/signin");
    throw error;
  } finally {
    requestQueue.setRefreshing(false);
  }
}

function shouldRefreshToken(error: AxiosError): boolean {
  return (
    error.response?.status === API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED &&
    (error.response?.data as ApiError)?.errorCode ===
      API_CONSTANTS.ERROR_CODES.AUTHENTICATION.JWT_EXPIRED
  );
}

function shouldRetryRequest(
  error: AxiosError,
  config: CustomInternalRequestConfig
): boolean {
  return (
    config.retry !== undefined &&
    config.retry > (config._retryCount || 0) &&
    (!error.response?.status ||
      (error.response?.status >= 500 && error.response?.status <= 599) ||
      error.response?.status === 429 ||
      ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(error.code || ""))
  );
}

async function handleRetry(
  instance: AxiosInstance,
  config: CustomInternalRequestConfig
): Promise<AxiosResponse> {
  config._retryCount = (config._retryCount || 0) + 1;

  const delay = calculateRetryDelay(config);
  await new Promise((resolve) => setTimeout(resolve, delay));

  return instance(config);
}

function calculateRetryDelay(config: CustomInternalRequestConfig): number {
  const baseDelay = config.retryDelay || API_CONSTANTS.CONFIG.BASE_RETRY_DELAY;
  const retryCount = config._retryCount || 0;

  return (
    Math.min(
      baseDelay * Math.pow(2, retryCount),
      API_CONSTANTS.CONFIG.MAX_RETRY_DELAY
    ) +
    Math.random() * 100
  );
}

function updateRequestMetadata(config: CustomInternalRequestConfig): void {
  if (config?.metadata) {
    config.metadata.endTime = new Date();
    config.metadata.duration =
      config.metadata.endTime.getTime() - config.metadata.startTime.getTime();
  }
}

async function refreshToken(instance: AxiosInstance): Promise<AxiosResponse> {
  const refreshToken = TokenManager.getRefreshToken();
  return instance.post<AuthenticationResponse>(
    `${API_CONFIG.baseURL}/refresh-token`,
    {
      headers: { Authorization: `Bearer ${refreshToken}` },
      skipAuth: true,
    } as CustomRequestConfig
  );
}

const updateErrorStore = (
  error: unknown,
  config?: CustomInternalRequestConfig
) => {
  const errorStore = useErrorStore.getState();
  const errorObj = createErrorObjectCustomInternalRequestConfig(error, config);
  errorStore.addError(errorObj);
  return Promise.reject(error);
};

const axiosInstance = createAxiosInstance();
export default axiosInstance;
