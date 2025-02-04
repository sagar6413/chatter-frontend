import { useCallback, useEffect } from "react";
import { useError } from "./useError";
import { ApiError, API_CONSTANTS, ErrorSource } from "@/types/errors";

export function useNetworkError() {
  const { handleError } = useError();

  const handleNetworkError = useCallback(
    (error: Error) => {
      const networkError: ApiError = {
        type: "network:error",
        title: "Network Error",
        status: API_CONSTANTS.HTTP_STATUS.NETWORK_ERROR,
        detail: error.message || "Failed to connect to the server",
        name: error.name || "NetworkError",
        message: error.message || "Network connection error",
        timestamp: new Date().toISOString(),
        properties: {
          error,
        },
      };
      handleError(networkError, "network" as ErrorSource);
    },
    [handleError]
  );

  const handleTimeout = useCallback(
    (operation: string) => {
      const timeoutError: ApiError = {
        type: "network:timeout",
        title: "Request Timeout",
        status: API_CONSTANTS.HTTP_STATUS.REQUEST_TIMEOUT,
        detail: `The ${operation} operation timed out`,
        name: "TimeoutError",
        message: "Request timed out",
        timestamp: new Date().toISOString(),
        properties: {
          operation,
        },
      };
      handleError(timeoutError, "network" as ErrorSource);
    },
    [handleError]
  );

  // Monitor online/offline status
  useEffect(() => {
    const handleOffline = () => {
      const offlineError: ApiError = {
        type: "network:offline",
        title: "No Internet Connection",
        status: API_CONSTANTS.HTTP_STATUS.NETWORK_ERROR,
        detail: "Your device is currently offline",
        name: "OfflineError",
        message: "No internet connection",
        timestamp: new Date().toISOString(),
      };
      handleError(offlineError, "network" as ErrorSource);
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, [handleError]);

  return {
    handleNetworkError,
    handleTimeout,
  };
}
