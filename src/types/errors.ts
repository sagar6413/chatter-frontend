export interface ProblemDetail {
    type: string;
    title: string;
    status: number;
    detail: string;
    instance?: string;
    errorCode: number;
    timestamp: string;
    violations?: Record<string, string>;
    errors?: Record<string, string>;
  }
  
  // Enum matching backend error codes
  export enum ErrorCode {
    // Generic Errors (1000-1999)
    INTERNAL_SERVER_ERROR = 1000,
    BAD_REQUEST = 1001,
    NOT_FOUND = 1002,
    UNAUTHORIZED = 1003,
    FORBIDDEN = 1004,
    UNSUCCESSFUL_SERIALIZATION = 1005,
  
    // Authentication Errors (2000-2999)
    INVALID_CREDENTIALS = 2000,
    ACCOUNT_LOCKED = 2001,
    ACCOUNT_DISABLED = 2002,
    INVALID_TOKEN = 2003,
    EXPIRED_TOKEN = 2004,
    INSUFFICIENT_PERMISSIONS = 2005,
    USERNAME_ALREADY_EXISTS = 2006,
    USER_NOT_FOUND = 2007,
    INVALID_EMAIL = 2008,
    INVALID_USERNAME = 2009,
    INVALID_PASSWORD = 2010,
    INVALID_DISPLAY_NAME = 2011,
    INVALID_USER_DATA = 2012,
    JWT_SIGNATURE_INVALID = 2014,
    JWT_EXPIRED = 2015,
    JWT_MALFORMED = 2016,
    ACCESS_DENIED = 2017,
    BAD_CREDENTIALS = 2018,
    ILLEGAL_ARGUMENT = 2019,
    EMAIL_ALREADY_EXISTS = 2020,
  
    // Group Errors (10000-10999)
    GROUP_NOT_FOUND = 10000,
    GROUP_FULL = 10001,
    GROUP_MEMBERSHIP_NOT_FOUND = 10002,
    USER_NOT_IN_GROUP = 10003,
  
    // Chat Errors (11000-11999)
    CONVERSATION_NOT_FOUND = 11000,
    INVALID_CONVERSATION_TYPE = 11001,
  
    // Message Errors (12000-12999)
    MESSAGE_NOT_FOUND = 12001,
    INVALID_STATUS_TRANSITION = 12002,
    CONVERSATION_DELETION_FAILED = 12003
  }
  
  