import { AxiosError } from "axios";

import { CustomInternalRequestConfig } from "@/types/axios";

import { CustomRequestConfig } from "@/types/axios";
import { API_CONSTANTS, ApiError } from "@/types/errors";

const createErrorObject = <
  TConfig extends {
    url?: string;
    method?: string;
    metadata?: {
      duration?: number;
      retryCount?: number;
    };
  }
>(
  error: unknown,
  config?: TConfig
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

// Wrapper functions for specific configurations
export const createErrorObjectCustomRequestConfig = (
  error: unknown,
  config?: CustomRequestConfig
): ApiError => createErrorObject(error, config);

export const createErrorObjectCustomInternalRequestConfig = (
  error: unknown,
  config?: CustomInternalRequestConfig
): ApiError => createErrorObject(error, config);

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
