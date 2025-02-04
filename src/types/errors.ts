export interface ApiError extends Error {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
  properties?: Record<string, unknown>;
  errorCode?: number;
  timestamp?: string;
}

export interface WebSocketError extends ApiError {
  connectionId?: string;
  attemptCount?: number;
  lastAttemptTime?: string;
}

export type ErrorSource = "api" | "websocket" | "react" | "unknown";

export interface ErrorState {
  errors: Array<ApiError | WebSocketError>;
  errorCount: number;
  hasUnreadErrors: boolean;
  lastErrorTimestamp?: string;
}

export const API_CONSTANTS = {
  ERROR_CODES: {
    GENERIC: {
      INTERNAL_SERVER_ERROR: 1000,
      BAD_REQUEST: 1001,
      NOT_FOUND: 1002,
      UNAUTHORIZED: 1003,
      FORBIDDEN: 1004,
      UNSUCCESSFUL_SERIALIZATION: 1005,
    },
    AUTHENTICATION: {
      INVALID_CREDENTIALS: 2000,
      ACCOUNT_LOCKED: 2001,
      ACCOUNT_DISABLED: 2002,
      INVALID_TOKEN: 2003,
      EXPIRED_TOKEN: 2004,
      INSUFFICIENT_PERMISSIONS: 2005,
      USERNAME_ALREADY_EXISTS: 2006,
      USER_NOT_FOUND: 2007,
      INVALID_EMAIL: 2008,
      INVALID_USERNAME: 2009,
      INVALID_PASSWORD: 2010,
      INVALID_DISPLAY_NAME: 2011,
      INVALID_USER_DATA: 2012,
      JWT_SIGNATURE_INVALID: 2014,
      JWT_EXPIRED: 2015,
      JWT_MALFORMED: 2016,
      ACCESS_DENIED: 2017,
      BAD_CREDENTIALS: 2018,
      ILLEGAL_ARGUMENT: 2019,
      EMAIL_ALREADY_EXISTS: 2020,
    },
    GROUP: {
      GROUP_NOT_FOUND: 10000,
      GROUP_FULL: 10001,
      GROUP_MEMBERSHIP_NOT_FOUND: 10002,
      USER_NOT_IN_GROUP: 10003,
    },
    CHAT: {
      CONVERSATION_NOT_FOUND: 11000,
      INVALID_CONVERSATION_TYPE: 11001,
    },
    MESSAGE: {
      MESSAGE_NOT_FOUND: 12001,
      INVALID_STATUS_TRANSITION: 12002,
      CONVERSATION_DELETION_FAILED: 12003,
    },
  },
  HTTP_STATUS: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    SERVER_ERROR: 500,
    REQUEST_TIMEOUT: 408,
    NETWORK_ERROR: 504,
  },

  CONFIG: {
    DEFAULT_TIMEOUT: 10000,
    DEFAULT_RETRIES: 3,
    BASE_RETRY_DELAY: 1000,
    MAX_RETRY_DELAY: 10000,
  },
  PUBLIC_ROUTES: ["/signin", "/signup", "/forgot-password"] as const,
} as const;
