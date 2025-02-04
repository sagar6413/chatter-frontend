//--./src/services/groupChatService.ts--
import { api } from "@/util/apiUtil";
import { AxiosError } from "axios";
import {
  GroupConversationResponse,
  GroupSettingsResponse,
  GroupRequest,
  UserResponse,
} from "@/types";

export const createGroupChat = async (
  groupRequest: GroupRequest
): Promise<GroupConversationResponse> => {
  try {
    const response = await api.post<GroupConversationResponse>(
      "/group",
      groupRequest
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error creating group chat:", error);
    throw new Error("Error creating group chat");
  }
};

export const fetchGroupConversations = async (): Promise<
  GroupConversationResponse[]
> => {
  try {
    const response = await api.get<GroupConversationResponse[]>("/group-chats");
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error fetching group conversations in groupChatService.ts",
      error
    );
    throw new Error("Error fetching group conversations");
  }
};

export const updateGroupSettings = async (
  groupId: number,
  settings: GroupSettingsResponse
): Promise<GroupSettingsResponse> => {
  try {
    const response = await api.put<GroupSettingsResponse>(
      `/${groupId}/settings`,
      settings
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error updating group settings in groupChatService.ts",
      error
    );
    throw new Error("Error updating group settings in groupChatService.ts");
  }
};

export const addParticipants = async (
  groupId: number,
  usernames: Set<string>
): Promise<Set<UserResponse>> => {
  try {
    const response = await api.post<Set<UserResponse>>(
      `/${groupId}/participants`,
      Array.from(usernames)
    );
    return response;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error adding participants in groupChatService.ts", error);
    throw new Error("Error adding participants in groupChatService.ts");
  }
};

export const removeParticipant = async (
  groupId: number,
  username: string
): Promise<void> => {
  try {
    await api.delete<void>(`/${groupId}/participants/${username}`);
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error removing participant in groupChatService.ts", error);
    throw new Error("Error removing participant in groupChatService.ts");
  }
};
