//--./src/services/privateChatService.ts--
import { api } from "@/util/apiUtil";
import { AxiosError } from "axios";
import { PrivateConversationResponse } from "@/types";

export const createPrivateChat = async (
  username: string
): Promise<PrivateConversationResponse> => {
  try {
    const response = await api.post<PrivateConversationResponse>(
      `/private/${username}`
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error creating private chat in privateChatService.ts:",
      error
    );
    throw new Error("Error creating private chat in privateChatService.ts");
  }
};

export const getPrivateChats = async (): Promise<
  PrivateConversationResponse[]
> => {
  try {
    const response = await api.get<PrivateConversationResponse[]>(
      "/private-chats"
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error fetching private chats in privateChatService.ts:",
      error
    );
    throw new Error("Error fetching private chats in privateChatService.ts");
  }
};
