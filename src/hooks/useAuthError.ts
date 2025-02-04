import { useCallback } from "react";
import { useError } from "./useError";
import { ApiError, API_CONSTANTS, ErrorSource } from "@/types/errors";
import { useRouter } from "next/navigation";

export function useAuthError() {
  const { handleError } = useError();
  const router = useRouter();

  const handleAuthError = useCallback(
    (error: Error) => {
      const authError: ApiError = {
        type: "auth:error",
        title: "Authentication Error",
        status: API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
        detail: error.message || "Authentication failed",
        name: error.name || "AuthError",
        message: error.message || "Authentication error",
        timestamp: new Date().toISOString(),
        properties: {
          error,
        },
      };
      handleError(authError, "auth" as ErrorSource);
    },
    [handleError]
  );

  const handleTokenExpired = useCallback(() => {
    const tokenError: ApiError = {
      type: "auth:token_expired",
      title: "Session Expired",
      status: API_CONSTANTS.HTTP_STATUS.UNAUTHORIZED,
      detail: "Your session has expired. Please sign in again.",
      name: "TokenExpiredError",
      message: "Session expired",
      timestamp: new Date().toISOString(),
    };
    handleError(tokenError, "auth" as ErrorSource);

    // Clear auth state
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");

    // Redirect to login
    router.push("/signin");
  }, [handleError, router]);

  const handleUnauthorized = useCallback(() => {
    const unauthorizedError: ApiError = {
      type: "auth:unauthorized",
      title: "Unauthorized Access",
      status: API_CONSTANTS.HTTP_STATUS.FORBIDDEN,
      detail: "You do not have permission to access this resource.",
      name: "UnauthorizedError",
      message: "Unauthorized access",
      timestamp: new Date().toISOString(),
    };
    handleError(unauthorizedError, "auth" as ErrorSource);

    // Redirect to home or appropriate page
    router.push("/");
  }, [handleError, router]);

  return {
    handleAuthError,
    handleTokenExpired,
    handleUnauthorized,
  };
}
