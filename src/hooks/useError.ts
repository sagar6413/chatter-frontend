import { useCallback, useMemo } from "react";
import { useErrorStore } from "@/store/errorStore";
import { ApiError, ErrorSource } from "@/types/errors";

interface ErrorHookReturn {
  errors: ApiError[];
  addError: (error: ApiError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  handleError: (error: unknown, source?: ErrorSource) => void;
  hasErrors: boolean;
  latestError?: ApiError;
  errorCount: number;
  hasUnreadErrors: boolean;
  markErrorsAsRead: () => void;
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
    (error: unknown, source: ErrorSource = "unknown") => {
      let errorObject: ApiError;

      if ((error as ApiError).type) {
        errorObject = error as ApiError;
      } else if (error instanceof Error) {
        errorObject = {
          type: `error:${source}`,
          title: error.name || "Application Error",
          status: 500,
          detail: error.message,
          timestamp: new Date().toISOString(),
          properties: {
            stack: error.stack,
            source,
          },
        };
      } else {
        errorObject = {
          type: `error:${source}`,
          title: "Unknown Error",
          status: 500,
          detail: String(error),
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
  };
};
