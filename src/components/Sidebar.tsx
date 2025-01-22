"use client";

import { useState, useMemo, useCallback } from "react";
import { Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./ConversationList";
import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { SearchResults } from "./SearchResults";
import { useUserStore } from "@/store/userStore";
import { signOut } from "@/services/authService";
import { searchUser } from "@/services/userService";
import {
  ConversationType,
  GroupConversationResponse,
  PrivateConversationResponse,
  SearchResult,
} from "@/types/index";
import { UserProfileHeader } from "./UserProfileHeader.";
import { SearchBar } from "./SearchBar";
import { set } from "lodash";

export function Sidebar() {
  // Move all hooks to the top level of the component
  const { user, setUser } = useUserStore();
  console.log("In Sidebar", user);

  const [searchResults, setSearchResults] = useState<SearchResult>({});
  const [activeTab, setActiveTab] = useState<ConversationType>(
    ConversationType.PRIVATE
  );
  const [selectedConversation, setSelectedConversation] = useState<
    PrivateConversationResponse | GroupConversationResponse
  >();

  const handleSearchUser = useCallback(async (query: string) => {
    if (query.length <= 2) return;

    try {
      const searchResult = await searchUser(query);
      setSearchResults(searchResult);
      console.log(searchResult);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  }, []);

  const conversationHeaderData = useMemo(() => {
    if (!selectedConversation) return null;
    return {
      avatar:
        activeTab === ConversationType.PRIVATE
          ? (selectedConversation as PrivateConversationResponse).contact.avatar
          : (selectedConversation as GroupConversationResponse).avatar,
      fallback:
        activeTab === ConversationType.PRIVATE
          ? (
              selectedConversation as PrivateConversationResponse
            ).contact.displayName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase()
          : (selectedConversation as GroupConversationResponse).groupName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase(),
      displayName:
        activeTab === ConversationType.PRIVATE
          ? (selectedConversation as PrivateConversationResponse).contact
              .displayName
          : (selectedConversation as GroupConversationResponse).groupName,
      status:
        activeTab === ConversationType.PRIVATE
          ? (selectedConversation as PrivateConversationResponse).contact.status
          : undefined,
    };
  }, [selectedConversation, activeTab]);

  // Handle authentication check after all hooks are defined
  if (!user) {
    setUser();
    console.log("In sidebar updated user", user);
    if (!user) {
      console.log("In sidebar user is null");
      signOut();
      return null;
    }
  }

  return (
    <div className="flex h-full">
      <div className="w-80 border-r sidebar-gradient flex flex-col backdrop-blur-xl bg-slate-800/50 border-purple-500/20">
        <UserProfileHeader user={user} />
        <Separator />
        <SearchBar onSearch={handleSearchUser} />
        {searchResults && <SearchResults searchResults={searchResults} />}

        <div className="flex gap-2 p-4">
          {Object.values(ConversationType).map((type) => (
            <Button
              key={type}
              variant={activeTab === type ? "default" : "ghost"}
              className="flex-1"
              onClick={() => setActiveTab(type)}
            >
              {type === ConversationType.PRIVATE ? (
                <MessageCircle className="h-4 w-4 mr-2" />
              ) : (
                <Users className="h-4 w-4 mr-2" />
              )}
              {type}
            </Button>
          ))}
        </div>

        <Separator />

        <ScrollArea className="flex-1">
          <ConversationList
            activeTab={activeTab}
            setSelectedConversations={setSelectedConversation}
          />
        </ScrollArea>
      </div>

      {selectedConversation && (
        <div className="flex-1 flex flex-col">
          {conversationHeaderData && <ChatHeader {...conversationHeaderData} />}
          {selectedConversation && (
            <MessageList
              conversationId={selectedConversation.conversationId}
              user={user}
            />
          )}
          <MessageInput />
        </div>
      )}
    </div>
  );
}
