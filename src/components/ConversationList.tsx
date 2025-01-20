"use client";

import { ConversationType } from "@/types/index";
import {
  PrivateConversationResponse,
  GroupConversationResponse,
} from "@/types/index";
import { usePrivateChatStore } from "@/store/privateChatStore";
import { useGroupChatStore } from "@/store/groupChatStore";
import { ConversationItem } from "./ConversationItems";

interface ConversationListProps {
  activeTab: ConversationType;
  setSelectedConversations: (
    conversation: PrivateConversationResponse | GroupConversationResponse
  ) => void;
}

export function ConversationList({
  activeTab,
  setSelectedConversations,
}: ConversationListProps) {
  const { privateChats } = usePrivateChatStore();
  const { groupConversations } = useGroupChatStore();

  const conversations =
    activeTab === ConversationType.PRIVATE ? privateChats : groupConversations;

  return (
    <div
      className="space-y-1 overflow-y-auto"
      style={{ height: "calc(100vh - 160px)" }}
    >
      {conversations &&
        conversations.map((conversation) => {
          return (
            <ConversationItem
              key={conversation.conversationId}
              avatar={conversation.avatar}
              fallbackText={
                activeTab === ConversationType.PRIVATE
                  ? (
                      conversation as PrivateConversationResponse
                    ).contact.displayName
                      .split(" ")
                      .map((name) => name.charAt(0))
                      .join("")
                      .toUpperCase()
                  : (conversation as GroupConversationResponse).groupName
                      .split(" ")
                      .map((name) => name.charAt(0))
                      .join("")
                      .toUpperCase()
              }
              displayName={
                activeTab === ConversationType.PRIVATE
                  ? (conversation as PrivateConversationResponse).contact
                      .displayName
                  : (conversation as GroupConversationResponse).groupName
              }
              status={
                ConversationType.PRIVATE
                  ? (conversation as PrivateConversationResponse).contact.status
                  : undefined
              }
              createdAt={conversation.createdAt}
              lastMessage={conversation.lastMessage.content}
              onClick={() => setSelectedConversations(conversation)}
            />
          );
        })}
    </div>
  );
}
