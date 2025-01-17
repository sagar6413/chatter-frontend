# Real-Time Chat Application: Frontend Error Handling Documentation

## 1. Introduction

This document outlines the error handling strategy for the frontend of our real-time chat application, built with Next.js 15. It details the standardized error format, error codes, handling mechanisms, and best practices to ensure a robust and user-friendly experience. This documentation is designed to be used in conjunction with the backend API documentation and the provided Java exception handling code.

## 2. Standardized Error Format (Problem Details - RFC 7807)

The application adopts the Problem Details format (RFC 7807) for a consistent and informative error response structure. All API errors will be returned in the following format:

```typescript
interface ProblemDetail {
  type: string;        // URI reference identifying the error type
  title: string;       // Short, human-readable summary of the problem
  status: number;      // HTTP status code
  detail: string;      // Human-readable explanation specific to this occurrence
  instance?: string;   // URI reference identifying the specific occurrence of the problem (optional)
  errorCode: number;   // Application-specific error code
  timestamp: string;   // ISO 8601 timestamp of when the error occurred
  violations?: Record<string, string>; // Field-specific validation errors
  errors?: Record<string, string>; // Field-specific errors in forms
}
```

## 3. Error Codes and Categories

The following table defines the error codes used in the application, categorized for clarity. These error codes align with the backend `ErrorCode` enum.

### Generic Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 1000 | 500 | An unexpected error occurred | An unexpected error occurred. Please try again later. |
| 1001 | 400 | Invalid request | Invalid request. Please check your input. |
| 1002 | 404 | Resource not found | The requested resource could not be found. |
| 1003 | 401 | Unauthorized access | You are not authorized to perform this action. |
| 1004 | 403 | Access forbidden | Access to this resource is forbidden. |
| 1005 | 500 | Failed to serialize data | An error occurred while processing data. |

### Authentication & Authorization Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 2000 | 401 | Invalid email and/or password | Invalid username or password. |
| 2001 | 403 | User account is locked | Your account has been locked. Please contact support. |
| 2002 | 403 | User account is disabled | Your account has been disabled. |
| 2003 | 401 | Invalid authentication token | Invalid authentication token. |
| 2004 | 401 | Authentication token has expired | Your session has expired. Please log in again. |
| 2005 | 403 | Insufficient permissions for this operation | You do not have sufficient permissions for this operation. |
| 2006 | 400 | Username already exists | This username is already taken. |
| 2007 | 404 | User not found | User not found. |
| 2008 | 400 | Invalid email | Invalid email format. |
| 2009 | 400 | Invalid username | Invalid username format. |
| 2010 | 400 | Invalid password | Password does not meet requirements. |
| 2011 | 400 | Invalid display name | Invalid display name. |
| 2012 | 400 | Invalid user data | Invalid user data. |
| 2014 | 401 | JWT signature is invalid | Invalid authentication token. |
| 2015 | 401 | JWT token has expired | Your session has expired. Please log in again. |
| 2016 | 400 | JWT token is malformed | Invalid authentication token. |
| 2017 | 403 | Access denied | Access denied. |
| 2018 | 401 | Bad credentials | Invalid username or password. |
| 2019 | 400 | Illegal argument | Invalid input. |
| 2020 | 400 | Email already exists | This email is already registered. |

### Cache Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 6000 | 500 | Cache operation failed | An error occurred with our caching system. |
| 6001 | 500 | Failed to read from cache | Failed to retrieve data from cache. |
| 6002 | 500 | Failed to write to cache | Failed to save data to cache. |
| 6003 | 500 | Failed to delete from cache | Failed to remove data from cache. |

### Database Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 7000 | 500 | Database operation failed | An error occurred with our database. |
| 7001 | 400 | Database constraint violation | Invalid data. Please check your input. |
| 7002 | 500 | Failed to read from database | Failed to retrieve data from the database. |
| 7003 | 500 | Failed to write to database | Failed to save data to the database. |
| 7004 | 500 | Failed to update database | Failed to update data in the database. |
| 7005 | 500 | Failed to delete from database | Failed to delete data from the database. |
| 7006 | 400 | Primary key violation | Invalid data. Primary key violation. |
| 7007 | 400 | Foreign key violation | Invalid data. Foreign key violation. |
| 7008 | 400 | Unique constraint violation | Data already exists. Please provide unique values. |
| 7009 | 500 | Failed to create user | Failed to create user. |
| 7010 | 500 | Failed to update user | Failed to update user. |
| 7011 | 500 | Failed to delete user | Failed to delete user. |
| 7012 | 500 | Failed to fetch user | Failed to retrieve user information. |
| 7013 | 404 | Entity not found | The requested entity could not be found. |
| 7014 | 409 | Data integrity violation | Data integrity violation. Please check your input. |

### Validation Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 8000 | 400 | Invalid input data | Invalid input data. Please check your input. |
| 8001 | 400 | Missing required field | Missing required field. |
| 8002 | 400 | Method argument not valid | Invalid input. Please check your input. |
| 8004 | 405 | Method not allowed | This action is not allowed. |
| 8005 | 500 | Internal authentication service error | An error occurred during authentication. |

### External Service Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 9000 | 503 | External service is currently unavailable | An external service is currently unavailable. Please try again later. |

### Group Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 10000 | 404 | Group not found | The requested group could not be found. |
| 10001 | 400 | Group is full | This group has reached its maximum capacity. |
| 10002 | 404 | Not a member of this group | You are not a member of this group. |
| 10003 | 400 | User is not a member of this group | User is not a member of this group. |

### Chat Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 11000 | 404 | Chat not found | The requested chat could not be found. |
| 11001 | 400 | Invalid conversation type | Invalid conversation type. |

### Message Errors

| Error Code | HTTP Status | Description | User-Friendly Message |
|------------|-------------|-------------|----------------------|
| 12001 | 404 | Message not found | The requested message could not be found. |
| 12002 | 400 | Invalid message status transition | Invalid message status transition. |
| 12003 | 400 | Failed to delete conversation | Failed to delete the conversation. |

## 4. Global Error Handling in Next.js 15

Next.js 15 offers several mechanisms for handling errors globally. We will leverage a combination of these approaches:

### 4.1. API Client Error Interceptor

An Axios interceptor is implemented to catch and process errors from API responses before they reach the components. This allows for centralized handling of common error patterns like authentication failures and token refresh.

```typescript
import axios, { AxiosError } from 'axios';
import { ApiError, ErrorHandler } from '@/utils/errorHandler';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError = ErrorHandler.parseApiError(error);

    if (ErrorHandler.isAuthenticationError(apiError)) {
      // Redirect to login or implement token refresh logic
      // Example: window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;
```
OR

```typescript
// lib/api/interceptor.ts
import { toast } from 'react-hot-toast';

export const errorInterceptor = async (error: any) => {
  const problemDetail = error.response?.data as ProblemDetail;
  
  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('API Error:', {
      code: problemDetail.errorCode,
      detail: problemDetail.detail,
      timestamp: problemDetail.timestamp
    });
  }
  
  // Handle specific error types
  if (problemDetail) {
    // Authentication errors
    if (isAuthError(problemDetail.errorCode)) {
      await authErrorHandler.handle(problemDetail);
      return;
    }
    
    // Validation errors
    if (problemDetail.violations) {
      return Promise.reject(new ValidationError(problemDetail));
    }
    
    // Chat-specific errors
    if (isChatError(problemDetail.errorCode)) {
      const recovery = chatErrorRecovery.handleGroupError(problemDetail);
      handleRecoveryAction(recovery);
      return;
    }
  }
  
  // Generic error handling
  toast.error(getErrorMessage(problemDetail?.errorCode));
  return Promise.reject(error);
};
```

### 4.2. Error Boundaries

React Error Boundaries are used to gracefully handle errors that occur within components. This prevents a single component error from crashing the entire application. In Next.js 15, the `ErrorBoundary` component can be created to wrap parts of the application.

```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render a fallback UI
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### 4.3. Custom Error Page (error.js)

```typescript
// pages/_app.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function App({ Component, pageProps }) {
  return (
    <ErrorBoundary fallback={(error) => <ErrorPage error={error} />}>
      <Component {...pageProps} />
    </ErrorBoundary>
  );
}
```

Next.js 15 allows for the creation of a custom error page (`error.js`) within app router, enabling us to handle errors that occur outside of component rendering or before they reach an Error Boundary. This allows for a more user-friendly experience when unexpected errors occur.

```tsx
// app/error.js
'use client'

import { useEffect } from 'react'

export default function Error({ error, reset }: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
}
```

### 4.4. Server-Side Error Handling

For errors that occur during data fetching on the server (e.g., within `getServerSideProps` or `getStaticProps`), Next.js allows for returning error information as part of the props. This can be used to display an error state on the page or redirect to a different route.

```tsx
// pages/my-page.tsx

import { GetServerSideProps } from 'next';

interface Props {
  error?: string;
}

const MyPage: React.FC<Props> = ({ error }) => {
  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>My Page Content</div>;
};

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  try {
    // Fetch data from API
    // ...
    return { props: {} };
  } catch (error) {
    return { props: { error: 'Failed to fetch data' } };
  }
};

export default MyPage;
```

### 4.5 Handling Specific Error Scenarios

This section provides specific guidance on handling common error scenarios in the chat application context:

#### 4.5.1 Authentication Errors

When authentication fails (e.g., invalid credentials, expired token), redirect the user to the login page or prompt them to re-enter their credentials. Clear any stored authentication tokens from local storage or cookies.

Critical error codes requiring special handling:
- 2014: JWT_SIGNATURE_INVALID
- 2015: JWT_EXPIRED
- 2016: JWT_MALFORMED

Implementation strategy:

```typescript
// Authentication error interceptor
export const authErrorHandler = {
  handle: (error: ProblemDetail) => {
    if (error.errorCode >= 2000 && error.errorCode < 3000) {
      // Clear authentication state
      authStore.clearAuth();
      
      // Preserve current route for post-login redirect
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      
      // Show appropriate message
      toast.error(getAuthErrorMessage(error.errorCode));
    }
  }
};
```

See `apiClient` interceptor example in section 4.1.

#### 4.5.2 Authorization Errors

If a user attempts to access a resource they are not authorized to access (e.g., a private chat they are not a member of), display an appropriate error message and potentially redirect them to a different part of the application (e.g., their list of available chats).

```typescript
// Example in a chat component
useEffect(() => {
  const fetchChatData = async () => {
    try {
      // Fetch chat data
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errorCode === ErrorCode.GROUP_MEMBERSHIP_NOT_FOUND || apiError.errorCode === ErrorCode.USER_NOT_IN_GROUP) {
        // Display error message
        toast.error('You do not have access to this chat.');
        // Redirect to chat list
        router.push('/chats'); 
      }
    }
  };

  fetchChatData();
}, []);
```

#### 4.5.3. Chat and Group Related Errors

Handle errors specific to chat and group operations, such as group not found, group full, or user not in group. Display user-friendly error messages and provide appropriate actions, such as redirecting to the group list or refreshing the group information.

```typescript
// Example in a group component
useEffect(() => {
  const fetchGroupData = async () => {
    try {
      // Fetch group data
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errorCode === ErrorCode.GROUP_NOT_FOUND) {
        // Display error message
        toast.error('This group no longer exists.');
        // Redirect to groups list
        router.push('/groups'); 
      } else if (apiError.errorCode === ErrorCode.GROUP_FULL) {
        // Display error message
        toast.error('This group has reached its maximum capacity.');
      }
    }
  };

  fetchGroupData();
}, []);
```
OR

```typescript
// Chat error recovery strategies
export const chatErrorRecovery = {
  handleGroupError: (error: ProblemDetail) => {
    switch (error.errorCode) {
      case 10000: // GROUP_NOT_FOUND
      case 10002: // GROUP_MEMBERSHIP_NOT_FOUND
        return {
          action: 'REDIRECT',
          destination: '/groups',
          message: 'Group no longer available'
        };
      case 10001: // GROUP_FULL
        return {
          action: 'SHOW_MESSAGE',
          message: 'Group has reached maximum capacity'
        };
    }
  },
  
  handleMessageError: (error: ProblemDetail) => {
    switch (error.errorCode) {
      case 12001: // MESSAGE_NOT_FOUND
        return {
          action: 'REMOVE_MESSAGE',
          message: 'Message no longer available'
        };
      case 12002: // INVALID_STATUS_TRANSITION
        return {
          action: 'REFRESH_MESSAGE_STATE'
        };
    }
  }
};
```

#### 4.5.4. Real-Time Connection Errors

Handle errors related to the real-time connection (e.g., WebSocket connection failure). Display a message indicating that the real-time features are temporarily unavailable and implement a reconnection strategy. Consider using a library like `stomp.js & sock.js` for managing the connection and handling reconnection logic which alins with spring boot web-socket infrastructure.


```typescript
// Error state management using React Context
interface ChatErrorState {
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastError: ProblemDetail | null;
  reconnectAttempts: number;
}

// Reconnection strategy
const RECONNECT_INTERVALS = [0, 2000, 5000, 10000, 30000]; // Progressive delays
const MAX_RECONNECT_ATTEMPTS = 5;
```

Key handling scenarios:
- Connection loss detection
- Automatic reconnection with exponential backoff
- Message delivery status tracking
- Offline message queueing

## 5. Form Error Handling

Form submissions are a common source of errors. We will utilize a combination of client-side validation and server-side error handling to provide a seamless user experience:

### 5.1. Client-Side Validation

Client-side validation serves as the first line of defense against invalid data entry and provides immediate feedback to users. By validating form inputs before they reach the server, we can enhance the user experience and reduce unnecessary server load.

When implementing client-side validation, we recommend using React Hook Form alongside Zod for type-safe schema validation. This combination provides several advantages:

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define validation schema using Zod
const userSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(20, 'Username cannot exceed 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string()
    .email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
});

type UserFormData = z.infer<typeof userSchema>;

const RegistrationForm = () => {
  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    watch 
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    mode: 'onChange' // Enable real-time validation
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      // Handle form submission
      await apiClient.post('/api/users/register', data);
    } catch (error) {
      // Error handling will be covered in section 5.2
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="form-field">
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          {...register('username')}
          className={errors.username ? 'error' : ''}
        />
        {errors.username && (
          <span className="error-message">{errors.username.message}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className={errors.email ? 'error' : ''}
        />
        {errors.email && (
          <span className="error-message">{errors.email.message}</span>
        )}
      </div>

      <div className="form-field">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className={errors.password ? 'error' : ''}
        />
        {errors.password && (
          <span className="error-message">{errors.password.message}</span>
        )}
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Registering...' : 'Register'}
      </button>
    </form>
  );
};

export default RegistrationForm;
```

This implementation provides several key features:

1. Real-time validation: The form validates inputs as users type, providing immediate feedback rather than waiting for form submission.

2. Type safety: By using Zod schemas with TypeScript, we ensure type safety across our form handling logic and can catch potential type-related issues during development.

3. Comprehensive validation rules: The schema defines clear rules for each field, including:
   - Length requirements
   - Pattern matching through regular expressions
   - Format validation (e.g., email format)
   - Custom error messages for each validation rule

4. Accessibility: The implementation includes proper labeling and ARIA attributes to ensure the form is accessible to all users.

5. Loading states: The form handles submission states appropriately, disabling the submit button while processing to prevent duplicate submissions.

By implementing thorough client-side validation, we can:
- Reduce server load by catching invalid inputs early
- Improve user experience with immediate feedback
- Prevent common user errors before they reach the server
- Maintain data quality by enforcing consistent validation rules

### 5.2. Server-Side Validation Error Handling

Handle validation errors returned from the API (error code 8002) and map them to the corresponding form fields. Display the error messages clearly to the user.

```tsx
import { useForm } from 'react-hook-form';
import apiClient from '@/utils/apiClient';
import { ApiError, ErrorHandler } from '@/utils/errorHandler';

interface FormData {
  username: string;
  email: string;
  // other fields...
}

const MyForm = () => {
  const { register, handleSubmit, setError, formState: { errors } } = useForm<FormData>();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await apiClient.post('/api/users', data);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.errorCode === 8002 && apiError.violations) {
        Object.entries(apiError.violations).forEach(([field, message]) => {
          setError(field as keyof FormData, { type: 'server', message });
        });
      } else {
        // Handle other errors
        console.error(apiError);
      }
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...register('username')} />
      {errors.username && <span>{errors.username.message}</span>}

      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}

      {/* other fields... */}

      <button type="submit">Submit</button>
    </form>
  );
};

export default MyForm;
```

## 6. User-Friendly Error Messages

Error messages displayed to the user should be clear, concise, and helpful. Avoid technical jargon and provide guidance on how to resolve the issue. A mapping of error codes to user-friendly messages is maintained in the `ErrorHandler`.

```typescript
// utils/errorHandler.ts

// ... other code ...

export class ErrorHandler {
  // ... other methods ...

  static getUserFriendlyMessage(error: ApiError): string {
    const code = error.errorCode;
    switch (code) {
      case ErrorCode.INVALID_CREDENTIALS:
      case ErrorCode.BAD_CREDENTIALS:
        return 'Invalid username or password';
      case ErrorCode.ACCOUNT_LOCKED:
        return 'Your account has been locked. Please contact support';
      case ErrorCode.JWT_EXPIRED:
        return 'Your session has expired. Please sign in again';
      case ErrorCode.GROUP_FULL:
        return 'This group has reached its maximum capacity';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
}
```

## 7. Error Recovery and Prevention

Implement strategies to recover from errors gracefully and prevent them from occurring in the first place:

### 7.1. Automatic Retries

For transient errors (e.g., network issues, temporary service unavailability), implement automatic retries with exponential backoff. This can be achieved using libraries like `axios-retry`. This approach helps handle temporary network glitches or service disruptions without requiring user intervention.

### 7.2. Token Refresh

Implement automatic token refresh logic to handle expired JWTs (error code 2015) seamlessly. This ensures that the user's session remains active without requiring them to log in again manually. The refresh mechanism should work in the background, maintaining a smooth user experience while ensuring security.

### 7.3. Optimistic Updates

Use optimistic updates to improve the perceived performance of the application. When a user performs an action (e.g., sends a message), update the UI immediately as if the action was successful. If the action fails, revert the UI and display an error message. This approach provides immediate feedback while handling potential failures gracefully.

```typescript
const useOptimisticUpdate = <T>(
  mutationFn: () => Promise<T>,
  rollbackFn: () => void
) => {
  const execute = async () => {
    try {
      // Perform optimistic update
      await mutationFn();
    } catch (error) {
      // Rollback on failure
      rollbackFn();
      throw error;
    }
  };
  
  return { execute };
};
```

### 7.4. Input Validation

Implement thorough input validation on both the client-side and server-side to prevent invalid data from being processed. Use a combination of form libraries and backend validation rules. This multi-layered approach ensures data integrity while providing immediate feedback to users.

### 7.5. State Recovery

For complex operations, consider implementing state recovery mechanisms. This allows users to resume their work from where they left off if an error occurs. Techniques like local storage or server-side session management can be used to preserve important state information and prevent data loss.

### 7.6. Graceful Degradation

Design the application to handle situations where certain features are unavailable due to errors. For example, if the real-time messaging service is down, fall back to a polling mechanism or display a message indicating that real-time updates are temporarily unavailable. This ensures that core functionality remains accessible even when some features are compromised.

### 7.7. Monitoring and Alerting

Implement robust monitoring and alerting systems to track errors in production. Tools like Sentry, Rollbar, or custom logging solutions can be used to capture and analyze errors in real-time. This allows for proactive identification and resolution of issues before they significantly impact users.

The monitoring system should track:
- Error frequency and patterns
- User impact and affected features
- Performance degradation
- System resource utilization
- API endpoint health
- Real-time connection status

### 7.8 Message Delivery Guarantees

```typescript
interface MessageState {
  id: string;
  status: 'sending' | 'sent' | 'failed';
  retryCount: number;
}

const MESSAGE_RETRY_LIMIT = 3;

const messageRetryStrategy = {
  shouldRetry: (message: MessageState) => 
    message.status === 'failed' && message.retryCount < MESSAGE_RETRY_LIMIT,
  
  retry: async (message: MessageState) => {
    // Implement retry logic
  }
};
```