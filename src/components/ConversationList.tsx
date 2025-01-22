"use client";

import { ConversationType } from "@/types/index";
import {
  PrivateConversationResponse,
  GroupConversationResponse,
} from "@/types/index";
import { usePrivateChatStore } from "@/store/privateChatStore";
import { useGroupChatStore } from "@/store/groupChatStore";
import { ConversationItem } from "./ConversationItems";
import { useEffect, useState, useMemo } from "react";

// Type alias for the union type
type Conversation = PrivateConversationResponse | GroupConversationResponse;

interface ConversationListProps {
  activeTab: ConversationType;
  setSelectedConversations: (conversation: Conversation) => void;
}

// Helper functions for cleaner prop calculations in ConversationItem
const getFallbackText = (
  conversation: Conversation,
  activeTab: ConversationType
) => {
  if (activeTab === ConversationType.PRIVATE) {
    const privateConversation = conversation as PrivateConversationResponse;
    return (
      privateConversation.contact?.displayName
        ?.split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase() ?? ""
    );
  } else {
    const groupConversation = conversation as GroupConversationResponse;
    return (
      groupConversation.groupName
        ?.split(" ")
        .map((name) => name.charAt(0))
        .join("")
        .toUpperCase() ?? ""
    );
  }
};

const getDisplayName = (
  conversation: Conversation,
  activeTab: ConversationType
) => {
  return activeTab === ConversationType.PRIVATE
    ? (conversation as PrivateConversationResponse).contact?.displayName ?? ""
    : (conversation as GroupConversationResponse).groupName ?? "";
};

export function ConversationList({
  activeTab,
  setSelectedConversations,
}: ConversationListProps) {
  const { privateChats, fetchPrivateChats } = usePrivateChatStore();
  const { groupConversations, fetchGroupChats } = useGroupChatStore();

  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === ConversationType.PRIVATE) {
          await fetchPrivateChats();
        } else {
          await fetchGroupChats();
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // Implement more robust error handling (e.g., display an error message to the user)
      }
    };

    fetchData();
  }, [activeTab, fetchPrivateChats, fetchGroupChats]); // Add fetch functions to dependencies

  useEffect(() => {
    setConversations(
      activeTab === ConversationType.PRIVATE ? privateChats : groupConversations
    );
  }, [activeTab, privateChats, groupConversations]);

  const memoizedConversationItems = useMemo(() => {
    return conversations.map((conversation) => (
      <ConversationItem
        key={conversation.conversationId}
        avatar={conversation.avatar}
        fallbackText={getFallbackText(conversation, activeTab)}
        displayName={getDisplayName(conversation, activeTab)}
        status={
          activeTab === ConversationType.PRIVATE
            ? (conversation as PrivateConversationResponse).contact?.status
            : undefined
        }
        createdAt={conversation.createdAt}
        lastMessage={conversation.lastMessage?.content ?? ""}
        onClick={() => setSelectedConversations(conversation)}
      />
    ));
  }, [conversations, activeTab, setSelectedConversations]);

  return (
    <div
      className="space-y-1 overflow-y-auto"
      style={{ height: "calc(100vh - 160px)" }}
    >
      {memoizedConversationItems}
    </div>
  );
}
