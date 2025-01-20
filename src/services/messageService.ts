// messageService.ts
import { MessageDeliveryStatusResponse, MessageResponse, Page } from "@/types";
import { api } from "@/util/axiosInstance";
import { AxiosError } from "axios";

interface MessageQueryParams {
  page?: number;
  size?: number;
  before?: number;
}

export const messageService = {
  async loadInitialMessages(
    conversationId: number,
    params: MessageQueryParams = { page: 0, size: 30 }
  ) {
    try {
      const response = await api.get<Page<MessageResponse>>(
        `/api/conversations/${conversationId}/messages`,
        { params }
      );
      return response.content;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },

  async loadMoreMessages(conversationId: number, params: MessageQueryParams) {
    try {
      const response = await api.get<Page<MessageResponse>>(
        `/api/conversations/${conversationId}/messages`,
        { params }
      );
      return response.content;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },

  /**
   * Updates message delivery status
   */
  async updateMessageStatus(
    conversationId: number,
    messageId: number,
    status: string
  ) {
    try {
      const response = await api.put<MessageDeliveryStatusResponse>(
        `/api/conversations/${conversationId}/messages/${messageId}/status`,
        { status }
      );
      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      throw new Error("Error fetching user");
    }
  },
};
