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
      console.error("Error creating private chat:", error.response?.data);
    } else {
      console.error("Error creating private chat:", error);
    }
    throw new Error("Error creating private chat");
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
      console.error("Error fetching private chats:", error.response?.data);
    } else {
      console.error("Error fetching private chats:", error);
    }
    throw new Error("Error fetching private chats");
  }
};
