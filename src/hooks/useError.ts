import { useCallback, useMemo } from "react";
import { useErrorStore } from "@/store/errorStore";
import { ApiError, ErrorSource, ErrorType } from "@/types/errors";

interface ErrorHookReturn {
  errors: ApiError[];
  addError: (error: ApiError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  handleError: (error: unknown, source?: ErrorSource, type?: ErrorType) => void;
  hasErrors: boolean;
  latestError?: ApiError;
  errorCount: number;
  hasUnreadErrors: boolean;
  markErrorsAsRead: () => void;
  getErrorsByType: (type: ErrorType) => ApiError[];
  getErrorsBySource: (source: ErrorSource) => ApiError[];
}

export const useError = (): ErrorHookReturn => {
  const {
    errors,
    addError,
    removeError,
    clearErrors,
    errorCount,
    hasUnreadErrors,
    markErrorsAsRead,
  } = useErrorStore();

  const handleError = useCallback(
    (error: unknown, source: ErrorSource = "unknown", type?: ErrorType) => {
      let errorObject: ApiError;

      if ((error as ApiError).type) {
        errorObject = error as ApiError;
      } else if (error instanceof Error) {
        errorObject = {
          type: type || `error:${source}`,
          title: error.name || "Application Error",
          status: 500,
          detail: error.message,
          name: error.name || "Error",
          message: error.message,
          timestamp: new Date().toISOString(),
          properties: {
            stack: error.stack,
            source,
          },
        };
      } else {
        errorObject = {
          type: type || `error:${source}`,
          title: "Unknown Error",
          status: 500,
          detail: String(error),
          name: "UnknownError",
          message: String(error),
          timestamp: new Date().toISOString(),
          properties: {
            source,
          },
        };
      }

      addError(errorObject);
    },
    [addError]
  );

  const hasErrors = useMemo(() => errors.length > 0, [errors]);
  const latestError = useMemo(() => errors[errors.length - 1], [errors]);

  const getErrorsByType = useCallback(
    (type: ErrorType) => errors.filter((error) => error.type === type),
    [errors]
  );

  const getErrorsBySource = useCallback(
    (source: ErrorSource) =>
      errors.filter((error) => error.properties?.source === source),
    [errors]
  );

  return {
    errors,
    addError,
    removeError,
    clearErrors,
    handleError,
    hasErrors,
    latestError,
    errorCount,
    hasUnreadErrors,
    markErrorsAsRead,
    getErrorsByType,
    getErrorsBySource,
  };
};
