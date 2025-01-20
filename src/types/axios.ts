import { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export interface RequestMetadata {
  startTime: Date;
  endTime?: Date;
  duration?: number;
  retryCount?: number;
}

export interface CustomRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
  retry?: number;
  retryDelay?: number;
  metadata?: RequestMetadata;
  _retry?: boolean;
  _retryCount?: number;
}

export interface CustomInternalRequestConfig
  extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
  retry?: number;
  retryDelay?: number;
  metadata?: RequestMetadata;
  _retry?: boolean;
  _retryCount?: number;
}
