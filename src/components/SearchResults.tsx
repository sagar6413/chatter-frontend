"use client";

import { useState, useMemo } from "react";
import {
  SearchResult,
  UserResponse,
  ConversationType,
  PrivateConversationResponse,
  GroupConversationResponse,
  MessageResponse,
} from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Users, User, Mail, Hash, Search } from "lucide-react";
import { createPrivateChat } from "@/mock/api";

interface SearchResultsProps {
  searchResults: SearchResult;
  setActiveTab: (tab: ConversationType) => void;
  setSelectedConversation: (
    conversation: PrivateConversationResponse | GroupConversationResponse
  ) => void;
  searchQuery: string;
}

enum SearchResultTab {
  USERS = "USERS",
  PRIVATE_CHATS = "PRIVATE_CHATS",
  GROUP_CHATS = "GROUP_CHATS",
  MESSAGES = "MESSAGES",
}

export function SearchResults({
  searchResults,
  setActiveTab,
  setSelectedConversation,
  searchQuery,
}: SearchResultsProps) {
  const defaultTab = useMemo(() => {
    if (searchResults.users && searchResults.users.length > 0) {
      return SearchResultTab.USERS;
    } else if (
      searchResults.privateChats &&
      searchResults.privateChats.length > 0
    ) {
      return SearchResultTab.PRIVATE_CHATS;
    } else if (
      searchResults.groupChats &&
      searchResults.groupChats.length > 0
    ) {
      return SearchResultTab.GROUP_CHATS;
    } else if (searchResults.messages && searchResults.messages.length > 0) {
      return SearchResultTab.MESSAGES;
    }
    return SearchResultTab.USERS;
  }, [searchResults]);

  const [activeSearchTab, setActiveSearchTab] =
    useState<SearchResultTab>(defaultTab);

  const handleUserClick = async (user: UserResponse) => {
    const privateConversation = await createPrivateChat(user.username);
    setActiveTab(ConversationType.PRIVATE);
    setSelectedConversation(privateConversation);
  };

  const handlePrivateChatClick = (chat: PrivateConversationResponse) => {
    setActiveTab(ConversationType.PRIVATE);
    setSelectedConversation(chat);
  };

  const handleGroupChatClick = (chat: GroupConversationResponse) => {
    setActiveTab(ConversationType.GROUP);
    setSelectedConversation(chat);
  };

  const getMessagePreview = (message: MessageResponse) => {
    if (message.content) {
      return message.content.length > 30
        ? message.content.substring(0, 30) + "..."
        : message.content;
    } else if (message.mediaItems && message.mediaItems.size > 0) {
      const mediaTypes = Array.from(message.mediaItems).map(
        (media) => media.fileType
      );
      return `[${mediaTypes.join(", ")}]`;
    }
    return "No preview available";
  };

  const filteredSearchResults = useMemo(() => {
    const filtered: SearchResult = {};
    if (
      activeSearchTab === SearchResultTab.USERS &&
      searchResults.users?.length
    ) {
      filtered.users = searchResults.users;
    }
    if (
      activeSearchTab === SearchResultTab.PRIVATE_CHATS &&
      searchResults.privateChats?.length
    ) {
      filtered.privateChats = searchResults.privateChats;
    }
    if (
      activeSearchTab === SearchResultTab.GROUP_CHATS &&
      searchResults.groupChats?.length
    ) {
      filtered.groupChats = searchResults.groupChats;
    }
    if (
      activeSearchTab === SearchResultTab.MESSAGES &&
      searchResults.messages?.length
    ) {
      filtered.messages = searchResults.messages;
    }
    return filtered;
  }, [activeSearchTab, searchResults]);

  const highlightMatch = (text: string) => {
    if (!searchQuery) {
      return text;
    }

    const regex = new RegExp(`(${searchQuery})`, "gi");
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, index) =>
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-300/70">
              {part}
            </mark>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </span>
    );
  };

  return (
    <div className="px-2 py-2 h-fit overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={
                  activeSearchTab === SearchResultTab.USERS
                    ? "default"
                    : "ghost"
                }
                onClick={() => setActiveSearchTab(SearchResultTab.USERS)}
              >
                <User className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Users</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={
                  activeSearchTab === SearchResultTab.PRIVATE_CHATS
                    ? "default"
                    : "ghost"
                }
                onClick={() =>
                  setActiveSearchTab(SearchResultTab.PRIVATE_CHATS)
                }
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Private Chats</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={
                  activeSearchTab === SearchResultTab.GROUP_CHATS
                    ? "default"
                    : "ghost"
                }
                onClick={() => setActiveSearchTab(SearchResultTab.GROUP_CHATS)}
              >
                <Users className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Group Chats</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={
                  activeSearchTab === SearchResultTab.MESSAGES
                    ? "default"
                    : "ghost"
                }
                onClick={() => setActiveSearchTab(SearchResultTab.MESSAGES)}
              >
                <Mail className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Messages</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Users Section */}
      {filteredSearchResults.users &&
        filteredSearchResults.users.length > 0 && (
          <div>
            {filteredSearchResults.users.map((user) => (
              <TooltipProvider key={user.id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-start gap-2 hover:bg-gray-600/50 p-2 rounded-md"
                      onClick={() => handleUserClick(user)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>
                          {user.displayName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-200">
                          {highlightMatch(user.displayName)}
                        </span>
                        <span className="text-xs text-gray-400">
                          @{highlightMatch(user.username)}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.displayName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}

      {/* Private Chats Section */}
      {filteredSearchResults.privateChats &&
        filteredSearchResults.privateChats.length > 0 && (
          <div className="mt-4">
            {filteredSearchResults.privateChats.map((chat) => (
              <TooltipProvider key={chat.conversationId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-start gap-2 hover:bg-gray-600/50 p-2 rounded-md"
                      onClick={() => handlePrivateChatClick(chat)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chat.contact.avatar} />
                        <AvatarFallback>
                          {chat.contact.displayName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-200">
                          {highlightMatch(chat.contact.displayName)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {chat.lastMessage &&
                            highlightMatch(getMessagePreview(chat.lastMessage))}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{chat.contact.displayName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}

      {/* Group Chats Section */}
      {filteredSearchResults.groupChats &&
        filteredSearchResults.groupChats.length > 0 && (
          <div className="mt-4">
            {filteredSearchResults.groupChats.map((chat) => (
              <TooltipProvider key={chat.conversationId}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full flex items-center justify-start gap-2 hover:bg-gray-600/50 p-2 rounded-md"
                      onClick={() => handleGroupChatClick(chat)}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={chat.avatar} />
                        <AvatarFallback>
                          {chat.groupName
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-200">
                          {highlightMatch(chat.groupName)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {chat.lastMessage &&
                            highlightMatch(getMessagePreview(chat.lastMessage))}
                        </span>
                      </div>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{chat.groupName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}

      {/* Messages Section */}
      {filteredSearchResults.messages &&
        filteredSearchResults.messages.length > 0 && (
          <div className="mt-4">
            {filteredSearchResults.messages.map((message) => (
              <Button
                key={message.id}
                variant="ghost"
                className="w-full flex items-center justify-start gap-2 hover:bg-gray-600/50 p-2 rounded-md"
                onClick={() => {
                  /* Handle message click - you might want to open the conversation here */
                }}
              >
                {/* You might want to add an icon or indicator for messages */}
                <div className="flex flex-col items-start">
                  <span className="text-sm font-medium text-gray-200">
                    {highlightMatch(message.senderDisplayName)}:
                  </span>
                  <span className="text-xs text-gray-400">
                    {highlightMatch(getMessagePreview(message))}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        )}
    </div>
  );
}
