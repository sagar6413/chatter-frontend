import { GroupConversationResponse, GroupSettingsResponse } from "@/types/index";
import { create } from "zustand";
import Cookies from "js-cookie";
import axiosInstance from "@/util/axiosInstance";
import { AxiosError } from "axios";

interface GroupChatState {
  groupConversations: GroupConversationResponse[];
  setGroupConversations: (groupConversations: GroupConversationResponse[]) => void;
  fetchGroupConversations: () => Promise<void>;
  fetchGroupSettings: (conversationId: number) => Promise<GroupSettingsResponse>;
}