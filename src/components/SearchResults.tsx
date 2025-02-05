"use client";

import { useState, useMemo, useCallback } from "react";
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
import { MessageCircle, Users, User, Mail } from "lucide-react";
import { Separator } from "./ui/separator";
import { useChatStore } from "@/store/chatStore";

interface SearchResultsProps {
  searchResults: SearchResult;
  setActiveTab: (tab: ConversationType) => void;
  setSelectedConversation: (
    conversation: PrivateConversationResponse | GroupConversationResponse
  ) => void;
  searchQuery: string;
  clearSearch: () => void;
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
  clearSearch,
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

  const { createPrivateChat } = useChatStore();

  const handleUserClick = useCallback(
    async (user: UserResponse) => {
      try {
        await createPrivateChat(user.username);
        setActiveTab(ConversationType.PRIVATE);
        clearSearch();
      } catch (error) {
        console.error("Error creating private chat:", error);
      }
    },
    [createPrivateChat, setActiveTab, clearSearch]
  );

  const handlePrivateChatClick = (chat: PrivateConversationResponse) => {
    setActiveTab(ConversationType.PRIVATE);
    setSelectedConversation(chat);
    clearSearch();
  };

  const handleGroupChatClick = (chat: GroupConversationResponse) => {
    setActiveTab(ConversationType.GROUP);
    setSelectedConversation(chat);
    clearSearch();
  };

  const getMessagePreview = useCallback((message: MessageResponse) => {
    if (message.content) {
      return message.content.length > 30
        ? `${message.content.substring(0, 30)}...`
        : message.content;
    }
    return "No preview available";
  }, []);

  const filteredSearchResults = useMemo(() => {
    const filtered: SearchResult = {};
    if (activeSearchTab === SearchResultTab.USERS) {
      filtered.users = searchResults.users;
    }
    if (activeSearchTab === SearchResultTab.PRIVATE_CHATS) {
      filtered.privateChats = searchResults.privateChats;
    }
    if (activeSearchTab === SearchResultTab.GROUP_CHATS) {
      filtered.groupChats = searchResults.groupChats;
    }
    if (activeSearchTab === SearchResultTab.MESSAGES) {
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

  const searchTabs = [
    {
      tab: SearchResultTab.USERS,
      icon: User,
      tooltip: "Users",
    },
    {
      tab: SearchResultTab.PRIVATE_CHATS,
      icon: MessageCircle,
      tooltip: "Private Chats",
    },
    {
      tab: SearchResultTab.GROUP_CHATS,
      icon: Users,
      tooltip: "Group Chats",
    },
    {
      tab: SearchResultTab.MESSAGES,
      icon: Mail,
      tooltip: "Messages",
    },
  ];

  const createAvatarFallback = (displayName: string) => {
    return displayName
      .split(" ")
      .map((name) => name[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="px-2 py-2 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        {searchTabs.map(({ tab, icon: Icon, tooltip }) => (
          <TooltipProvider key={tab}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  variant={activeSearchTab === tab ? "default" : "ghost"}
                  onClick={() => setActiveSearchTab(tab)}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Users Section */}
      <div>
        {filteredSearchResults.users &&
        filteredSearchResults.users.length > 0 ? (
          <>
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
                          {createAvatarFallback(user.displayName)}
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
            <p className="text-gray-400 text-sm mt-2 text-center">
              No More Data
            </p>
          </>
        ) : (
          SearchResultTab.USERS === activeSearchTab && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              Sorry, no users found.
            </p>
          )
        )}
      </div>

      {/* Private Chats Section */}
      <div className="mt-4">
        {filteredSearchResults.privateChats &&
        filteredSearchResults.privateChats.length > 0 ? (
          <>
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
                          {createAvatarFallback(chat.contact.displayName)}
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
                <Separator className="my-2" />
              </TooltipProvider>
            ))}
            <p className="text-gray-400 text-sm mt-2 text-center">
              No More Data
            </p>
          </>
        ) : (
          SearchResultTab.PRIVATE_CHATS === activeSearchTab && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              Sorry, no private chats found.
            </p>
          )
        )}
      </div>

      {/* Group Chats Section */}
      <div className="mt-4">
        {filteredSearchResults.groupChats &&
        filteredSearchResults.groupChats.length > 0 ? (
          <>
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
                          {createAvatarFallback(chat.groupName)}
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
            <p className="text-gray-400 text-sm mt-2 text-center">
              No More Data
            </p>
          </>
        ) : (
          SearchResultTab.GROUP_CHATS === activeSearchTab && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              Sorry, no group chats found.
            </p>
          )
        )}
      </div>

      {/* Messages Section */}
      <div className="mt-4">
        {filteredSearchResults.messages &&
        filteredSearchResults.messages.length > 0 ? (
          <>
            {filteredSearchResults.messages.map((message) => (
              <Button
                key={message.id}
                variant="ghost"
                className="w-full flex items-center justify-start gap-2 hover:bg-gray-600/50 p-2 rounded-md"
                onClick={() => {
                  /* Handle message click - you might want to open the conversation here */
                }}
              >
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
            <p className="text-gray-400 text-sm mt-2 text-center">
              No More Data
            </p>
          </>
        ) : (
          SearchResultTab.MESSAGES === activeSearchTab && (
            <p className="text-gray-400 text-sm mt-2 text-center">
              Sorry, no messages found.
            </p>
          )
        )}
      </div>
    </div>
  );
}
