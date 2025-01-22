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
      console.error("Error creating group chat:", error.response?.data);
    } else {
      console.error("Error creating group chat:", error);
    }
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
      console.error(
        "Error fetching group conversations:",
        error.response?.data
      );
    } else {
      console.error("Error fetching group conversations:", error);
    }
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
      console.error("Error updating group settings:", error.response?.data);
    } else {
      console.error("Error updating group settings:", error);
    }
    throw new Error("Error updating group settings");
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
      console.error("Error adding participants:", error.response?.data);
    } else {
      console.error("Error adding participants:", error);
    }
    throw new Error("Error adding participants");
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
      console.error("Error removing participant:", error.response?.data);
    } else {
      console.error("Error removing participant:", error);
    }
    throw new Error("Error removing participant");
  }
};
