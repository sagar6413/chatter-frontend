import { useState, useCallback } from "react";
import { useError } from "./useError";
import { ErrorSource } from "@/types/errors";

interface UseAsyncOptions<T> {
  errorSource?: ErrorSource;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {}
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);
  const { handleError } = useError();

  const execute = useCallback(
    async (...args: Args) => {
      try {
        setLoading(true);
        setError(null);
        const result = await asyncFunction(...args);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err as Error;
        setError(error);
        handleError(error, options.errorSource || "unknown");
        options.onError?.(error);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction, handleError, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}
