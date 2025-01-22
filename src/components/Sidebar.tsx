"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
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
// import { searchUser } from "@/services/userService";
import {
  ConversationType,
  GroupConversationResponse,
  PrivateConversationResponse,
  SearchResult,
} from "@/types/index";
import { UserProfileHeader } from "./UserProfileHeader.";
import { SearchBar } from "./SearchBar";
import { searchUser } from "@/mock/api";

export function Sidebar() {
  const { user, setUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<ConversationType>(
    ConversationType.PRIVATE
  );
  const [selectedConversation, setSelectedConversation] = useState<
    PrivateConversationResponse | GroupConversationResponse
  >();

  useEffect(() => {
    console.log("Selected conversation Changes : ", selectedConversation);
  }, [selectedConversation]);

  const handleSearchUser = useCallback(
    async (query: string) => {
      setSearchQuery(query);

      if (query.length <= 2) {
        setSearchResults(null);
        return;
      }

      try {
        const searchResult = await searchUser(query);
        setSearchResults(searchResult);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    },
    [setSearchQuery]
  );

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

  console.log("search user -->>", searchResults);

  return (
    <div className="flex h-full w-full">
      <div className="w-80 border-r sidebar-gradient flex flex-col backdrop-blur-xl bg-slate-800/50 border-purple-500/20">
        <UserProfileHeader
          displayName={user.displayName}
          avatar={user.avatar}
        />
        <Separator />
        <SearchBar onSearch={handleSearchUser} />
        {searchResults && (
          <SearchResults
            searchResults={searchResults}
            setActiveTab={setActiveTab}
            setSelectedConversation={setSelectedConversation}
            searchQuery={searchQuery}
          />
        )}

        {!searchResults && (
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
        )}

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
          <ChatHeader
            selectedConversation={selectedConversation}
            activeTab={activeTab}
          />
          <MessageList
            conversationId={selectedConversation.conversationId}
            username={user.username}
          />
          <MessageInput />
        </div>
      )}
    </div>
  );
}
