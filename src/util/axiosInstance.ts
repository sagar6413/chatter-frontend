import axios, { AxiosError, AxiosResponse, AxiosInstance } from "axios";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/util/cookieHandler";
import Router from "next/router";
import { API_CONSTANTS, ApiError } from "@/types/errors";
import {
  CustomRequestConfig,
  CustomInternalRequestConfig,
} from "@/types/axios";
import { AuthenticationResponse } from "@/types";
import { useErrorStore } from "@/store/errorStore";
import { calculateRetryDelay, isRetryableError } from "./errorUtils";

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
};

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create({
    ...API_CONFIG,
    validateStatus: (status) => status < 500,
  });

  const refreshState = {
    isRefreshing: false,
  };

  const failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }> = [];

  // Request interceptor
  instance.interceptors.request.use(
    (requestConfig: CustomInternalRequestConfig) => {
      const accessToken = getAccessToken();
      const isPublicRoute = API_CONSTANTS.PUBLIC_ROUTES.some((route) =>
        requestConfig.url?.includes(route)
      );
      // Initialize metadata for request timing
      requestConfig.metadata = {
        startTime: new Date(),
        retryCount: requestConfig._retryCount || 0,
      };
      if (accessToken && !isPublicRoute && !requestConfig.skipAuth) {
        requestConfig.headers.Authorization = `Bearer ${accessToken}`;
      }
      requestConfig.metadata = { startTime: new Date() };

      // Return a new object with the captured config
      return {
        ...requestConfig,
        capturedConfig: requestConfig,
      };
    },
    (error: unknown) => {
      const errorStore = useErrorStore.getState();
      const errorObj = createErrorObjectCustomInternalRequestConfig(error);
      errorStore.addError(errorObj);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      updateRequestMetadata(response.config as CustomInternalRequestConfig);
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomInternalRequestConfig;
      updateRequestMetadata(originalRequest);

      // Handle token refresh
      if (shouldRefreshToken(error)) {
        try {
          return await handleTokenRefreshFlow(
            instance,
            originalRequest,
            refreshState,
            failedQueue
          );
        } catch (refreshError) {
          const errorStore = useErrorStore.getState();
          const errorObj = createErrorObjectCustomInternalRequestConfig(
            refreshError,
            originalRequest
          );
          errorStore.addError(errorObj);
          return Promise.reject(errorObj);
        }
      }

      // Handle retries for specific errors
      if (shouldRetryRequest(error, originalRequest)) {
        return handleRequestRetry(instance, originalRequest);
      }

      // Store error and reject
      const errorStore = useErrorStore.getState();
      const errorObj = createErrorObjectCustomInternalRequestConfig(
        error,
        originalRequest
      );
      errorStore.addError(errorObj);

      return Promise.reject(errorObj);
    }
  );
  return instance;
};

async function handleTokenRefreshFlow(
  instance: AxiosInstance,
  originalRequest: CustomInternalRequestConfig,
  refreshState: { isRefreshing: boolean },
  failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
  }>
): Promise<AxiosResponse> {
  // If already refreshing, queue this request
  if (refreshState.isRefreshing) {
    // Return a new promise that will be resolved when the token is refreshed
    return new Promise((resolve, reject) => {
      failedQueue.push({
        resolve: (token: string) => {
          // When token is refreshed, update the original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(instance(originalRequest));
        },
        reject: (error: unknown) => {
          reject(error);
        },
      });
    });
  }

  // If not refreshing, start the refresh process
  refreshState.isRefreshing = true;
  originalRequest._retry = true;

  try {
    // Attempt to refresh the token
    const newTokens = await handleTokenRefresh();

    // Update the original request with the new token
    originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

    // Process all queued requests with the new token
    failedQueue.forEach(({ resolve }) => {
      resolve(newTokens.accessToken);
    });
    failedQueue = [];

    // Retry the original request with the new token
    return instance(originalRequest);
  } catch (refreshError) {
    // If refresh fails, reject all queued requests
    failedQueue.forEach(({ reject }) => {
      reject(refreshError);
    });
    failedQueue = [];

    // Clear tokens and redirect to login
    clearTokens();
    Router.push("/signin");

    // Reject the original request
    throw refreshError;
  } finally {
    refreshState.isRefreshing = false;
  }
}

// Token refresh handler
async function handleTokenRefresh(): Promise<AuthenticationResponse> {
  try {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await axios.get<AuthenticationResponse>(
      `${API_CONFIG.baseURL}/refresh-token`,
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        skipAuth: true,
      } as CustomRequestConfig
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);

    return response.data;
  } catch (error) {
    clearTokens();
    Router.push("/signin");
    throw error;
  }
}

function updateRequestMetadata(config: CustomInternalRequestConfig): void {
  if (config?.metadata) {
    config.metadata.endTime = new Date();
    config.metadata.duration =
      config.metadata.endTime.getTime() - config.metadata.startTime.getTime();
  }
}

function shouldRefreshToken(error: AxiosError): boolean {
  const errorData = error.response?.data as ApiError;
  return (
    error.response?.status === API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED &&
    errorData?.errorCode ===
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
    isRetryableError(error)
  );
}

async function handleRequestRetry(
  instance: AxiosInstance,
  config: CustomInternalRequestConfig
): Promise<AxiosResponse> {
  config._retryCount = (config._retryCount || 0) + 1;
  const delay = calculateRetryDelay(
    config._retryCount,
    config.retryDelay || API_CONSTANTS.CONFIG.BASE_RETRY_DELAY
  );

  await new Promise((resolve) => setTimeout(resolve, delay));
  return instance(config);
}

const createErrorObjectCustomInternalRequestConfig = (
  error: unknown,
  config?: CustomInternalRequestConfig
): ApiError => {
  const baseError = {
    timestamp: new Date().toISOString(),
    properties: {
      path: config?.url,
      method: config?.method?.toUpperCase(),
      duration: config?.metadata?.duration,
      retryCount: config?.metadata?.retryCount,
    },
  };

  if (error instanceof AxiosError && error.response?.data) {
    if (
      typeof error.response.data === "object" &&
      "type" in error.response.data
    ) {
      return {
        ...error.response.data,
        properties: {
          ...error.response.data.properties,
          ...baseError.properties,
        },
      } as ApiError;
    }
  }

  // Create a standardized error object for unexpected errors
  return {
    type: "about:blank",
    title: determineErrorTitle(error),
    status: determineErrorStatus(error),
    detail: determineErrorDetail(error),
    ...baseError,
  };
};

const createErrorObjectCustomRequestConfig = (
  error: unknown,
  config?: CustomRequestConfig
): ApiError => {
  const baseError = {
    timestamp: new Date().toISOString(),
    properties: {
      path: config?.url,
      method: config?.method?.toUpperCase(),
      duration: config?.metadata?.duration,
      retryCount: config?.metadata?.retryCount,
    },
  };

  if (error instanceof AxiosError && error.response?.data) {
    if (
      typeof error.response.data === "object" &&
      "type" in error.response.data
    ) {
      return {
        ...error.response.data,
        properties: {
          ...error.response.data.properties,
          ...baseError.properties,
        },
      } as ApiError;
    }
  }

  // Create a standardized error object for unexpected errors
  return {
    type: "about:blank",
    title: determineErrorTitle(error),
    status: determineErrorStatus(error),
    detail: determineErrorDetail(error),
    ...baseError,
  };
};

function determineErrorTitle(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") return "Request Timeout";
    if (error.code === "ERR_NETWORK") return "Network Error";
    return "HTTP Error";
  }
  return "Application Error";
}

function determineErrorStatus(error: unknown): number {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED")
      return API_CONSTANTS.HTTP_STATUS.REQUEST_TIMEOUT;
    if (error.code === "ERR_NETWORK")
      return API_CONSTANTS.HTTP_STATUS.NETWORK_ERROR;
    return error.response?.status || 500;
  }
  return 500;
}

function determineErrorDetail(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.code === "ECONNABORTED") return "The request timed out";
    if (error.code === "ERR_NETWORK") return "A network error occurred";
    return error.message || "An unexpected error occurred";
  }
  return "An unexpected error occurred";
}

const axiosInstance = createAxiosInstance();

// Request helpers with proper typing
export const api = {
  get: async <T>(url: string, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  post: async <T>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig
  ) => {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  put: async <T>(url: string, data?: unknown, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  delete: async <T>(url: string, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },
};

export default axiosInstance;
