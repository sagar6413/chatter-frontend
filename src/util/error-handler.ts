import { ApiError } from "@/types/errors";

import { ErrorCode } from "@/types/errors";


export class ErrorHandler {
    /**
     * Parses an API error response and returns a structured ApiError object
     */
    static parseApiError(error: any): ApiError {
      if (error.response?.data) {
        return new ApiError(error.response.data, error);
      }
      
      // Create a generic error if the structure isn't what we expect
      return new ApiError({
        type: 'about:blank',
        title: 'Unknown Error',
        status: 500,
        detail: error.message || 'An unexpected error occurred',
        errorCode: ErrorCode.INTERNAL_SERVER_ERROR,
        timestamp: new Date().toISOString()
      }, error);
    }
  
    /**
     * Handles specific error codes and returns appropriate user messages
     */
    static getUserFriendlyMessage(error: ApiError): string {
      const code = error.errorCode;
      
      switch (code) {
        // Authentication errors
        case ErrorCode.INVALID_CREDENTIALS:
        case ErrorCode.BAD_CREDENTIALS:
          return 'Invalid username or password';
          
        case ErrorCode.ACCOUNT_LOCKED:
          return 'Your account has been locked. Please contact support';
          
        case ErrorCode.ACCOUNT_DISABLED:
          return 'Your account has been disabled';
          
        case ErrorCode.JWT_EXPIRED:
          return 'Your session has expired. Please sign in again';
          
        // Resource errors
        case ErrorCode.NOT_FOUND:
        case ErrorCode.USER_NOT_FOUND:
        case ErrorCode.GROUP_NOT_FOUND:
        case ErrorCode.CONVERSATION_NOT_FOUND:
          return 'The requested resource could not be found';
          
        // Validation errors
        case ErrorCode.USERNAME_ALREADY_EXISTS:
          return 'This username is already taken';
          
        case ErrorCode.INVALID_USERNAME:
          return 'Invalid username format';
          
        case ErrorCode.INVALID_PASSWORD:
          return 'Password does not meet requirements';
          
        // Group errors
        case ErrorCode.GROUP_FULL:
          return 'This group has reached its maximum capacity';
          
        case ErrorCode.USER_NOT_IN_GROUP:
          return 'You are not a member of this group';
          
        // Default case
        default:
          return error.message || 'An unexpected error occurred';
      }
    }
  
    /**
     * Handles form validation errors
     */
    static getFormValidationErrors(error: ApiError): Record<string, string> {
      return {
        ...(error.violations || {}),
        ...(error.fieldErrors || {})
      };
    }
  
    /**
     * Checks if the error is an authentication error that requires re-login
     */
    static isAuthenticationError(error: ApiError): boolean {
      return [
        ErrorCode.JWT_EXPIRED,
        ErrorCode.JWT_SIGNATURE_INVALID,
        ErrorCode.JWT_MALFORMED,
        ErrorCode.INVALID_TOKEN,
        ErrorCode.UNAUTHORIZED
      ].includes(error.errorCode);
    }
  }
  
  // Example usage with an API client
  export const createApiClient = (baseURL: string) => {
    const client = axios.create({ baseURL });
    
    // Add response interceptor for error handling
    client.interceptors.response.use(
      response => response,
      error => {
        const apiError = ErrorHandler.parseApiError(error);
        
        // Handle authentication errors
        if (ErrorHandler.isAuthenticationError(apiError)) {
          // Redirect to login or refresh token
          window.location.href = '/login';
        }
        
        return Promise.reject(apiError);
      }
    );
    
    return client;
  };
  
  // Example React hook for error handling
  export function useApiError() {
    const [error, setError] = useState<ApiError | null>(null);
    
    const handleError = useCallback((error: any) => {
      const apiError = error instanceof ApiError ? error : ErrorHandler.parseApiError(error);
      setError(apiError);
      
      // You could also integrate with a toast notification system here
      toast.error(ErrorHandler.getUserFriendlyMessage(apiError));
    }, []);
    
    return {
      error,
      handleError,
      clearError: () => setError(null),
      errorMessage: error ? ErrorHandler.getUserFriendlyMessage(error) : null,
      validationErrors: error ? ErrorHandler.getFormValidationErrors(error) : {}
    };
  }

  /**
   * Here's how to use this error handling system in your components:
   function LoginForm() {
  const { handleError, validationErrors } = useApiError();
  
  const handleSubmit = async (data: SignInRequest) => {
    try {
      await authApi.signIn(data);
      // Handle successful login
    } catch (error) {
      handleError(error);
      // validationErrors will contain any field-specific errors
    }
  };
  
  return (
    <form>
      <input
        name="username"
        error={validationErrors.username}
      />

      </form>
    );
  }
    * For form validation:
  function SignUpForm() {
  const { handleError, validationErrors } = useApiError();
  
  // The hook automatically extracts field-specific errors
  // validationErrors might look like:
  // {
  //   username: "Username must be alphanumeric and between 3-50 characters",
  //   password: "Password must contain at least one special character"
  // }
}
   */