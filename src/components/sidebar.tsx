"use client";

import { Search, Users, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ConversationList } from "./conversation-list";
import { useState } from "react";
import { ConversationType, GroupConversationResponse, PrivateConversationResponse } from "@/types/index";
import { ChatHeader } from "./chat-header";
import { MessageList } from "./message-list";
import { MessageInput } from "./message-input";
import { useUserStore } from "@/store/userStore";
import { signOut } from "@/services/authService";
import {searchUser} from '@/services/userService';

export function Sidebar() {
  const [activeTab, setActiveTab] = useState<ConversationType>(ConversationType.PRIVATE);
  const { user } = useUserStore();
  if (!user) {
    signOut();
    return
  }
  const [selectedConversation, setSelectedConversations] = useState<PrivateConversationResponse | GroupConversationResponse>();

  const handleSearchUser =async (query: string) =>{
    try {
      const users = await searchUser(query);
      console.log(users);
    } catch (error) {
      
    }
  }

  return (
    <>
      <div className="w-80 border-r sidebar-gradient flex flex-col backdrop-blur-xl bg-slate-800/50 border-purple-500/20">
        {/* User Profile */}
        <div className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 to-slate-800/50 backdrop-blur-lg flex items-center justify-between gap-3">
          <div className="relative">
            <Avatar className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-500 p-[2px]">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-purple-300">
                {user.displayName.split(' ').map(name => name.charAt(0)).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-teal-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-purple-100">{user.displayName}</h2>
          </div>
        </div>

        <Separator />

        {/* Search */}
        <div className="px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <Input
              className="w-full bg-slate-700/50 border border-purple-500/20 rounded-lg pl-10 pr-4 py-2  focus:outline-none focus:border-purple-500 text-purple-100 placeholder-purple-400 transition-colors"
              placeholder="Search conversations..."
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4">
          <Button
            variant={activeTab === ConversationType.PRIVATE ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab(ConversationType.PRIVATE)}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {ConversationType.PRIVATE}
          </Button>
          <Button
            variant={activeTab === ConversationType.GROUP ? "default" : "ghost"}
            className="flex-1"
            onClick={() => setActiveTab(ConversationType.GROUP)}
          >
            <Users className="h-4 w-4 mr-2" />
            {ConversationType.GROUP}
          </Button>
        </div>

        <Separator />

        {/* Conversation List */}
        <ScrollArea className="flex-1">
          <ConversationList activeTab={activeTab} setSelectedConversations={setSelectedConversations} />
        </ScrollArea>
      </div>
      <div className="flex-1 flex flex-col">
        <ChatHeader />
        <MessageList />
        <MessageInput />
      </div>
    </>
  );
}
