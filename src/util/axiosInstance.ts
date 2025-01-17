// src/api/axiosInstance.ts
import axios, { 
  AxiosError, 
  AxiosResponse, 
  AxiosInstance 
} from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/util/cookieHandler';
import Router from 'next/router';
import { ProblemDetail } from '@/types/errors';
import { CustomRequestConfig, CustomInternalRequestConfig } from '@/types/axios';
import { AuthenticationResponse } from '@/types';

// Constants
const API_CONFIG: CustomRequestConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const PUBLIC_ROUTES = ['/signin', '/signup', '/forgot-password'] as const;

// Error handling
class ApiError extends Error {
  constructor(
    public status: number,
    public errorCode: number,
    message: string,
    public violations?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Create axios instance
const createAxiosInstance = (): AxiosInstance => {
  const instance = axios.create(API_CONFIG);

  // Request interceptor
  instance.interceptors.request.use(
    (config: CustomInternalRequestConfig) => {
      const accessToken = getAccessToken();
      const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
      
      if (accessToken && !isPublicRoute && !config.skipAuth) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(new ApiError(
        error.response?.status || 500,
        (error.response?.data as ProblemDetail)?.errorCode || 0,
        error.message
      ));
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as CustomInternalRequestConfig;
      const errorData = error.response?.data as ProblemDetail;

      if (
        error.response?.status === 401 && 
        errorData?.errorCode === 2004 && 
        originalRequest && 
        !originalRequest._retry
      ) {
        return handleTokenRefresh(instance, originalRequest);
      }

      return Promise.reject(new ApiError(
        error.response?.status || 500,
        errorData?.errorCode || 0,
        errorData?.detail || error.message,
        errorData?.violations
      ));
    }
  );

  return instance;
};

// Token refresh handler
async function handleTokenRefresh(
  instance: AxiosInstance, 
  originalRequest: CustomInternalRequestConfig
): Promise<AxiosResponse> {
  try {
    originalRequest._retry = true;
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.get<AuthenticationResponse>(
      `${API_CONFIG.baseURL}/refresh-token`,
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        skipAuth: true
      } as CustomRequestConfig
    );

    const { accessToken, refreshToken: newRefreshToken } = response.data;
    setTokens(accessToken, newRefreshToken);

    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
    return instance(originalRequest);

  } catch (error) {
    clearTokens();
    Router.push('/signin');
    throw error;
  }
}

const axiosInstance = createAxiosInstance();

// Request helpers with proper typing
export const api = {
  get: <T>(url: string, config?: CustomRequestConfig) => 
    axiosInstance.get<T>(url, config).then(response => response.data),
  
  post: <T>(url: string, data?: unknown, config?: CustomRequestConfig) => 
    axiosInstance.post<T>(url, data, config).then(response => response.data),
  
  put: <T>(url: string, data?: unknown, config?: CustomRequestConfig) => 
    axiosInstance.put<T>(url, data, config).then(response => response.data),
  
  delete: <T>(url: string, config?: CustomRequestConfig) => 
    axiosInstance.delete<T>(url, config).then(response => response.data)
};

export default axiosInstance;