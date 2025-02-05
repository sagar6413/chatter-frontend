import { useCallback, useState } from "react";
import { useToast } from "./use-toast";

export type ErrorSource =
  | "auth"
  | "network"
  | "websocket"
  | "api"
  | "validation"
  | "unknown";

export type ErrorType =
  | "AUTH"
  | "NETWORK"
  | "WEBSOCKET"
  | "API"
  | "VALIDATION"
  | "UNKNOWN";

interface ErrorState {
  errors: Record<ErrorSource, Error[]>;
  lastError: Error | null;
  retryCount: Record<string, number>;
}

interface ErrorHandlerOptions {
  showToast?: boolean;
  retryable?: boolean;
  maxRetries?: number;
}

const DEFAULT_OPTIONS: ErrorHandlerOptions = {
  showToast: true,
  retryable: false,
  maxRetries: 3,
};

const ERROR_MESSAGES: Record<ErrorType, string> = {
  AUTH: "Authentication error occurred. Please try logging in again.",
  NETWORK: "Network error occurred. Please check your connection.",
  WEBSOCKET: "Connection error occurred. Attempting to reconnect...",
  API: "Server error occurred. Please try again later.",
  VALIDATION: "Please check your input and try again.",
  UNKNOWN: "An unexpected error occurred.",
};

const DEFAULT_ERROR_STATE: ErrorState = {
  errors: {
    auth: [],
    network: [],
    websocket: [],
    api: [],
    validation: [],
    unknown: [],
  },
  lastError: null,
  retryCount: {},
};

export function useEnhancedError() {
  const [errorState, setErrorState] = useState<ErrorState>(DEFAULT_ERROR_STATE);

  const { toast } = useToast();

  const getErrorMessage = useCallback((error: Error, source: ErrorSource) => {
    if (error.message) return error.message;

    const errorType = source.toUpperCase() as ErrorType;
    return ERROR_MESSAGES[errorType] || ERROR_MESSAGES.UNKNOWN;
  }, []);

  const handleError = useCallback(
    (
      error: Error,
      source: ErrorSource,
      options: ErrorHandlerOptions = DEFAULT_OPTIONS
    ) => {
      const { showToast, retryable, maxRetries } = {
        ...DEFAULT_OPTIONS,
        ...options,
      };

      setErrorState((prev) => {
        const newErrors = {
          ...prev.errors,
          [source]: [...(prev.errors[source] || []), error],
        };

        const newRetryCount = retryable
          ? {
              ...prev.retryCount,
              [error.message]: (prev.retryCount[error.message] || 0) + 1,
            }
          : prev.retryCount;

        return {
          errors: newErrors,
          lastError: error,
          retryCount: newRetryCount,
        };
      });

      if (showToast) {
        toast({
          title: source.charAt(0).toUpperCase() + source.slice(1) + " Error",
          description: getErrorMessage(error, source),
          variant: "destructive",
        });
      }

      // Log error for monitoring
      console.error(`[${source.toUpperCase()}]`, error);

      if (retryable) {
        const currentRetries = errorState.retryCount[error.message] || 0;
        if (currentRetries < (maxRetries || DEFAULT_OPTIONS.maxRetries!)) {
          return true; // Indicate that retry is possible
        }
      }

      return false; // Indicate that retry is not possible
    },
    [errorState.retryCount, getErrorMessage, toast]
  );

  const clearErrors = useCallback((source?: ErrorSource) => {
    setErrorState((prev) => ({
      ...prev,
      errors: source
        ? { ...prev.errors, [source]: [] }
        : { ...DEFAULT_ERROR_STATE.errors },
      lastError: null,
      ...(source ? {} : { retryCount: {} }),
    }));
  }, []);

  const getErrorsForSource = useCallback(
    (source: ErrorSource) => errorState.errors[source] || [],
    [errorState.errors]
  );

  const hasErrors = useCallback(
    (source?: ErrorSource) => {
      if (source) {
        return (errorState.errors[source] || []).length > 0;
      }
      return Object.values(errorState.errors).some(
        (errors) => errors.length > 0
      );
    },
    [errorState.errors]
  );

  const canRetry = useCallback(
    (error: Error, maxRetries = DEFAULT_OPTIONS.maxRetries!) => {
      const retryCount = errorState.retryCount[error.message] || 0;
      return retryCount < maxRetries;
    },
    [errorState.retryCount]
  );

  return {
    errors: errorState.errors,
    lastError: errorState.lastError,
    handleError,
    clearErrors,
    getErrorsForSource,
    hasErrors,
    canRetry,
  };
}
