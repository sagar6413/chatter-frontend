import { API_CONSTANTS } from "@/types/errors";
import { AxiosError } from "axios";

export const isRetryableError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  return (
    !status || // Network errors (no response)
    (status >= 500 && status <= 599) || // Server errors
    status === 429 || // Rate limiting
    ["ECONNRESET", "ETIMEDOUT", "ENOTFOUND"].includes(error.code || "")
  );
};

export const calculateRetryDelay = (
  retryCount: number,
  baseDelay: number
): number => {
  const delay = Math.min(
    baseDelay * Math.pow(2, retryCount),
    API_CONSTANTS.CONFIG.MAX_RETRY_DELAY
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 100;
};
