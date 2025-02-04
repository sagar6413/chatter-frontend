//--./src/services/messageService.ts--
import { MessageDeliveryStatusResponse, MessageResponse, Page } from "@/types";
import { api } from "@/util/apiUtil";
import { AxiosError } from "axios";

interface MessageQueryParams {
  page?: number;
  size?: number;
  before?: number;
}

export const loadInitialMessages = async (
  conversationId: number,
  params: MessageQueryParams = { page: 0, size: 30 }
) => {
  try {
    const response = await api.get<Page<MessageResponse>>(
      `/api/conversations/${conversationId}/messages`,
      { params }
    );
    return response.content;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error while fetching messages for conversation", error);
    throw new Error("Error while fetching messages for conversation");
  }
};

export const loadMoreMessages = async (
  conversationId: number,
  params: MessageQueryParams
) => {
  try {
    const response = await api.get<Page<MessageResponse>>(
      `/api/conversations/${conversationId}/messages`,
      { params }
    );
    return response.content;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error while fetching messages for conversation", error);
    throw new Error("Error while fetching messages for conversation");
  }
};

export const updateMessageStatus = async (
  conversationId: number,
  messageId: number,
  status: string
) => {
  try {
    const response = await api.put<MessageDeliveryStatusResponse>(
      `/api/conversations/${conversationId}/messages/${messageId}/status`,
      { status }
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error while updating message delivery status", error);
    throw new Error("Error while updating message delivery status");
  }
};

export const messageService = {
  fetchMessages: async (
    conversationId: number,
    params: MessageQueryParams
  ): Promise<Page<MessageResponse>> => {
    try {
      const response = await api.get<Page<MessageResponse>>(
        `/api/conversations/${conversationId}/messages`,
        { params }
      );
      return response;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }
      console.error("Error fetching messages:", error);
      throw new Error("Error fetching messages");
    }
  },
};
