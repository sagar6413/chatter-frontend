import { AxiosRequestConfig, InternalAxiosRequestConfig } from "axios";

export interface CustomRequestConfig extends AxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
  }
  
  export interface CustomInternalRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
  }
  