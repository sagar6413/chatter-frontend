"use client";

import { useState, useCallback, useEffect } from "react";
import {
  FaUsers,
  FaComment,
  FaCog,
  FaSignOutAlt,
  FaBell,
  FaUserPlus,
} from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./ConversationList";
import { ChatHeader } from "./ChatHeader";
import MessageList from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useUserStore } from "@/store/userStore";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  ConversationType,
  GroupConversationResponse,
  PrivateConversationResponse,
  SearchResult,
  UserResponse,
} from "@/types/index";
import { SearchBar } from "./SearchBar";
import { searchUser, signOut } from "@/mock/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { MdAddComment } from "react-icons/md";
import { CreateNewGroup } from "./CreateNewGroup";
import { AddNewUser } from "./AddNewUser";
import { EmptyChatView } from "./EmptyChatView";
import { useChatStore } from "@/store/chatStore";

export function Sidebar() {
  const { user, setUser } = useUserStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<ConversationType>(
    ConversationType.PRIVATE
  );
  const [selectedConversation, setSelectedConversation] = useState<
    PrivateConversationResponse | GroupConversationResponse | null
  >(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isAddNewUserOpen, setIsAddNewUserOpen] = useState(false);
  const [isCreateNewGroup, setIsCreateNewGroup] = useState(false);

  const router = useRouter();
  const { createPrivateChat, createGroupChat } = useChatStore();

  const handleSearch = useCallback(
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

  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };

  const handleUserSelect = async (selectedUser: UserResponse) => {
    console.log("Starting chat with:", selectedUser);
    try {
      await createPrivateChat(selectedUser.username);
      setIsAddNewUserOpen(false);
    } catch (error) {
      console.error("Error creating private chat:", error);
    }
  };

  // Handle authentication check after all hooks are defined
  useEffect(() => {
    if (!user) {
      const attemptSetUser = async () => {
        await setUser(); // Assuming setUser is async
        if (!user) {
          signOut();
          router.push("/signin");
        }
      };
      attemptSetUser();
    }
  }, [user, setUser, router]);

  return (
    <div className="flex h-screen w-full flex-row">
      {/* Left sidebar section */}
      <div
        className={`${
          selectedConversation ? "hidden md:flex" : "flex"
        } w-full flex-col border-r border-purple-500/20 bg-slate-800/50 backdrop-blur-md md:w-96`}
      >
        {!isAddNewUserOpen && !isCreateNewGroup && (
          <div className="flex justify-between items-center p-2 gap-2">
            {searchQuery.length === 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Settings"
                    className={` ${
                      searchQuery.length === 0
                        ? "w-[10%] opacity-100"
                        : "w-0 opacity-0"
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <GiHamburgerMenu className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48 bg-slate-800 border-slate-700 transform translate-x-2"
                  align="end"
                  side="bottom"
                >
                  <DropdownMenuItem
                    className="flex gap-2 hover:bg-slate-700/50 focus:bg-slate-700/50"
                    onClick={() => setIsCreateNewGroup(true)}
                  >
                    <MdAddComment className="size-4 text-purple-300" />
                    <span className="text-purple-100">New Group</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex gap-2 hover:bg-slate-700/50 focus:bg-slate-700/50"
                    onClick={() => setIsAddNewUserOpen(true)}
                  >
                    <FaUserPlus className="size-4 text-purple-300" />
                    <span className="text-purple-100">New Private Chat</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex gap-2 hover:bg-slate-700/50 focus:bg-slate-700/50"
                    onClick={() => router.push("/settings")}
                  >
                    <FaCog className="size-4 text-purple-300" />
                    <span className="text-purple-100">Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex gap-2 hover:bg-slate-700/50 focus:bg-slate-700/50"
                    onClick={() => router.push("/notifications")}
                  >
                    <FaBell className="size-4 text-purple-300" />
                    <span className="text-purple-100">Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex gap-2 hover:bg-slate-700/50 focus:bg-slate-700/50"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt className="size-4 text-red-400" />
                    <span className="text-red-400">Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <SearchBar
              onSearch={handleSearch}
              searchResults={searchResults}
              setActiveTab={setActiveTab}
              setSelectedConversation={setSelectedConversation}
              searchQuery={searchQuery}
            />
          </div>
        )}
        {isAddNewUserOpen && (
          <AddNewUser
            onClose={() => setIsAddNewUserOpen(false)}
            onSelectUser={handleUserSelect}
            isOpen={isAddNewUserOpen}
          />
        )}
        {isCreateNewGroup && (
          <CreateNewGroup
            isOpen={isCreateNewGroup}
            onClose={() => setIsCreateNewGroup(false)}
            onCreateGroup={async (groupData) => {
              try {
                await createGroupChat(new Set(groupData.participants), {
                  name: groupData.groupName,
                  description: groupData.description || "",
                  onlyAdminsCanSend: false,
                  messageRetentionDays: 30,
                  maxMembers: 100,
                  isPublic: false,
                });
                setIsCreateNewGroup(false);
              } catch (error) {
                console.error("Error creating group:", error);
              }
            }}
          />
        )}

        {!searchResults && !isAddNewUserOpen && !isCreateNewGroup && (
          <div className="flex gap-2 p-2 md:px-4 ">
            {Object.values(ConversationType).map((type) => (
              <Button
                key={type}
                variant={activeTab === type ? "default" : "ghost"}
                className="flex-1 text-xs md:text-sm"
                onClick={() => setActiveTab(type)}
              >
                {type === ConversationType.PRIVATE ? (
                  <FaComment className="mr-2 h-4 w-4" />
                ) : (
                  <FaUsers className="mr-2 h-4 w-4" />
                )}
                {type}
              </Button>
            ))}
          </div>
        )}

        <Separator className="bg-purple-500/20" />

        {!isAddNewUserOpen && !isCreateNewGroup && (
          <ScrollArea className="flex-1">
            <ConversationList
              activeTab={activeTab}
              selectedConversation={selectedConversation}
              setSelectedConversations={setSelectedConversation}
            />
          </ScrollArea>
        )}
      </div>

      {/* Right chat section */}
      {selectedConversation ? (
        <div className="flex flex-1 flex-col">
          <ChatHeader
            avatar={
              "contact" in selectedConversation
                ? (selectedConversation as PrivateConversationResponse).contact
                    .avatar
                : (selectedConversation as GroupConversationResponse).avatar
            }
            avatarFallback={
              "contact" in selectedConversation
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
                    .toUpperCase()
            }
            displayName={
              "contact" in selectedConversation
                ? (selectedConversation as PrivateConversationResponse).contact
                    .displayName
                : (selectedConversation as GroupConversationResponse).groupName
            }
            status={
              "contact" in selectedConversation
                ? (selectedConversation as PrivateConversationResponse).contact
                    .status
                : undefined
            }
            setSelectedConversation={setSelectedConversation}
          />

          <MessageList
            conversationId={selectedConversation.conversationId}
            conversationType={activeTab}
          />

          <MessageInput
            conversationId={selectedConversation.conversationId}
            conversationType={activeTab}
          />
        </div>
      ) : (
        <EmptyChatView
          onNewChat={() => setIsAddNewUserOpen(true)}
          onNewGroup={() => setIsCreateNewGroup(true)}
        />
      )}
    </div>
  );
}
