import { create } from "zustand";
import {
  GroupConversationResponse,
  GroupRequest,
  GroupSettingsResponse,
} from "@/types/index";
// import { createGroupChat, fetchGroupConversations, updateGroupSettings, addParticipants, removeParticipant } from "@/services/groupChatService";
import {
  createGroupChat,
  fetchGroupConversations,
  updateGroupSettings,
  addParticipants,
  removeParticipant,
} from "@/mock/api";
import { AxiosError } from "axios";

interface GroupChatState {
  groupConversations: GroupConversationResponse[];
  fetchGroupChats: () => Promise<void>;
  createGroupChat: (groupRequest: GroupRequest) => Promise<void>;
  updateGroupSettings: (
    groupId: number,
    settings: GroupSettingsResponse
  ) => Promise<void>;
  addParticipants: (groupId: number, usernames: Set<string>) => Promise<void>;
  removeParticipant: (groupId: number, username: string) => Promise<void>;
}

export const useGroupChatStore = create<GroupChatState>()((set) => ({
  groupConversations: [],

  fetchGroupChats: async () => {
    try {
      const conversations = await fetchGroupConversations();
      set({ groupConversations: conversations });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error(
          "Error fetching group conversations:",
          error.response?.data
        );
      } else {
        console.error("Error fetching group conversations:", error);
      }
    }
  },

  createGroupChat: async (groupRequest: GroupRequest) => {
    try {
      const newGroupChat = await createGroupChat(groupRequest);
      set((state) => ({
        groupConversations: [...state.groupConversations, newGroupChat],
      }));
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error creating group chat:", error.response?.data);
      } else {
        console.error("Error creating group chat:", error);
      }
    }
  },

  updateGroupSettings: async (
    groupId: number,
    settings: GroupSettingsResponse
  ) => {
    try {
      const updatedGroupSettings = await updateGroupSettings(groupId, settings);
      set((state) => {
        const updatedGroupConversations = state.groupConversations.map(
          (group) => {
            if (group.conversationId === groupId) {
              return {
                ...group,
                groupSettings: updatedGroupSettings,
              };
            }
            return group;
          }
        );
        return {
          groupConversations: updatedGroupConversations,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error updating group settings:", error.response?.data);
      } else {
        console.error("Error updating group settings:", error);
      }
    }
  },
  addParticipants: async (groupId: number, usernames: Set<string>) => {
    try {
      const participants = await addParticipants(groupId, usernames);
      set((state) => {
        const updatedGroupConversations = state.groupConversations.map(
          (group) => {
            if (group.conversationId === groupId) {
              return {
                ...group,
                participants: new Set([...group.participants, ...participants]),
              };
            }
            return group;
          }
        );
        return {
          groupConversations: updatedGroupConversations,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error adding participants:", error.response?.data);
      } else {
        console.error("Error adding participants:", error);
      }
    }
  },
  removeParticipant: async (groupId: number, username: string) => {
    try {
      await removeParticipant(groupId, username);
      set((state) => {
        const updatedGroupConversations = state.groupConversations.map(
          (group) => {
            if (group.conversationId === groupId) {
              return {
                ...group,
                participants: new Set(
                  [...group.participants].filter(
                    (participant) => participant.username !== username
                  )
                ),
              };
            }
            return group;
          }
        );
        return {
          groupConversations: updatedGroupConversations,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error removing participant:", error.response?.data);
      } else {
        console.error("Error removing participant:", error);
      }
    }
  },
}));
