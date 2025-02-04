"use client";

import { useEffect, useCallback, useMemo, memo } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ConversationType } from "@/types";
import {
  usePrivateConversations,
  useGroupConversations,
  useWebSocketConnection,
} from "@/store/selectors";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type {
  PrivateConversationResponse,
  GroupConversationResponse,
} from "@/types";

interface ConversationListProps {
  activeTab: ConversationType;
  selectedConversation:
    | PrivateConversationResponse
    | GroupConversationResponse
    | null;
  setSelectedConversations: (
    conversation: PrivateConversationResponse | GroupConversationResponse | null
  ) => void;
}

const ConversationList = memo(function ConversationList({
  activeTab,
  selectedConversation,
  setSelectedConversations,
}: ConversationListProps) {
  const privateConversations = usePrivateConversations();
  const groupConversations = useGroupConversations();
  const { connected } = useWebSocketConnection();

  // Convert Maps to arrays for rendering
  const privateChats = useMemo(
    () => Array.from(privateConversations.values()),
    [privateConversations]
  );
  const groupChats = useMemo(
    () => Array.from(groupConversations.values()),
    [groupConversations]
  );

  const handleConversationSelect = useCallback(
    (conversation: PrivateConversationResponse | GroupConversationResponse) => {
      if (!connected) return;
      setSelectedConversations(conversation);
    },
    [connected, setSelectedConversations]
  );

  useEffect(() => {
    if (!connected) {
      setSelectedConversations(null);
    }
  }, [connected, setSelectedConversations]);

  const getAvatarFallback = useCallback((name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }, []);

  const renderPrivateChats = useMemo(() => {
    if (!privateChats.length) {
      return (
        <div className="text-center text-gray-400 py-4">
          No private conversations yet
        </div>
      );
    }

    return privateChats.map((conversation) => (
      <div
        key={conversation.conversationId}
        onClick={() => handleConversationSelect(conversation)}
        className={cn(
          "flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200",
          "hover:bg-slate-800/50",
          selectedConversation?.conversationId === conversation.conversationId
            ? "bg-slate-800/70"
            : "bg-transparent",
          !connected && "opacity-50 cursor-not-allowed"
        )}
      >
        <Avatar className="h-10 w-10 border-2 border-purple-600/20">
          <AvatarImage src={conversation.contact.avatar} />
          <AvatarFallback>
            {getAvatarFallback(conversation.contact.displayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-purple-50 truncate">
            {conversation.contact.displayName}
          </h3>
          {conversation.lastMessage && (
            <p className="text-sm text-gray-400 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    ));
  }, [
    privateChats,
    selectedConversation,
    connected,
    handleConversationSelect,
    getAvatarFallback,
  ]);

  const renderGroupChats = useMemo(() => {
    if (!groupChats.length) {
      return (
        <div className="text-center text-gray-400 py-4">
          No group conversations yet
        </div>
      );
    }

    return groupChats.map((conversation) => (
      <div
        key={conversation.conversationId}
        onClick={() => handleConversationSelect(conversation)}
        className={cn(
          "flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors duration-200",
          "hover:bg-slate-800/50",
          selectedConversation?.conversationId === conversation.conversationId
            ? "bg-slate-800/70"
            : "bg-transparent",
          !connected && "opacity-50 cursor-not-allowed"
        )}
      >
        <Avatar className="h-10 w-10 border-2 border-purple-600/20">
          <AvatarImage src={conversation.avatar} />
          <AvatarFallback>
            {getAvatarFallback(conversation.groupName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-purple-50 truncate">
            {conversation.groupName}
          </h3>
          {conversation.lastMessage && (
            <p className="text-sm text-gray-400 truncate">
              {conversation.lastMessage.content}
            </p>
          )}
        </div>
      </div>
    ));
  }, [
    groupChats,
    selectedConversation,
    connected,
    handleConversationSelect,
    getAvatarFallback,
  ]);

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col gap-2 p-4">
        {activeTab === ConversationType.PRIVATE ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-purple-50">
              Private Chats
            </h2>
            {renderPrivateChats}
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-purple-50">
              Group Chats
            </h2>
            {renderGroupChats}
          </div>
        )}
      </div>
    </ScrollArea>
  );
});

export { ConversationList };
