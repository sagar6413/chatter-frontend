//--./src/util/apiUtil.ts--
import { CustomRequestConfig } from "@/types/axios";
import axiosInstance from "./axiosInstance";
import { createErrorObjectCustomRequestConfig } from "./errorUtil";

export const api = {
  get: async <T>(url: string, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.get<T>(url, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  post: async <T>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig
  ) => {
    try {
      const response = await axiosInstance.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  put: async <T>(url: string, data?: unknown, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },
  patch: async <T>(
    url: string,
    data?: unknown,
    config?: CustomRequestConfig
  ) => {
    try {
      const response = await axiosInstance.patch<T>(url, data, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },

  delete: async <T>(url: string, config?: CustomRequestConfig) => {
    try {
      const response = await axiosInstance.delete<T>(url, config);
      return response.data;
    } catch (error) {
      throw createErrorObjectCustomRequestConfig(error, config);
    }
  },
};
