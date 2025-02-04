import { useCallback } from "react";
import { useError } from "@/hooks/useError";
import { AxiosError } from "axios";
import { ErrorSource } from "@/types/errors";

type ApiFunction<T, P extends unknown[]> = (...args: P) => Promise<T>;

export function useApiWithError<T, P extends unknown[]>(
  apiFunction: ApiFunction<T, P>,
  source: ErrorSource
) {
  const { handleError } = useError();

  const wrappedFunction = useCallback(
    async (...args: P): Promise<T | undefined> => {
      try {
        return await apiFunction(...args);
      } catch (error) {
        if (error instanceof AxiosError) {
          handleError(error.response?.data || error, source);
        } else {
          handleError(error, source);
        }
        return undefined;
      }
    },
    [apiFunction, handleError, source]
  );

  return wrappedFunction;
}
