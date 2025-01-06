"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "./ui/separator";

const conversations = [
  {
    id: 1,
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Hey, how are you doing?",
    time: "2m ago",
    unread: 2,
    online: true,
    type: "PRIVATE",
  },
  {
    id: 2,
    name: "Design Team",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    lastMessage: "New project requirements...",
    time: "1h ago",
    unread: 0,
    online: false,
    type: "GROUP",
  },
  {
    id: 3,
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Hey, how are you doing?",
    time: "2m ago",
    unread: 2,
    online: true,
    type: "PRIVATE",
  },
  {
    id: 4,
    name: "Design Team",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    lastMessage: "New project requirements...",
    time: "1h ago",
    unread: 236,
    online: false,
    type: "GROUP",
  },
  {
    id: 5,
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Hey, how are you doing?",
    time: "2m ago",
    unread: 6,
    online: true,
    type: "PRIVATE",
  },
  {
    id: 7,
    name: "Design Team",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    lastMessage: "New project requirements...",
    time: "1h ago",
    unread: 0,
    online: false,
    type: "GROUP",
  },
  {
    id: 8,
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Hey, how are you doing?",
    time: "2m ago",
    unread: 2,
    online: true,
    type: "PRIVATE",
  },
  {
    id: 9,
    name: "Design Team",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    lastMessage: "New project requirements...",
    time: "1h ago",
    unread: 0,
    online: false,
    type: "GROUP",
  },
  {
    id: 10,
    name: "Alice Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    lastMessage: "Hey, how are you doing?",
    time: "2m ago",
    unread: 2,
    online: true,
    type: "PRIVATE",
  },
  {
    id: 11,
    name: "Design Team",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
    lastMessage: "New project requirements...",
    time: "1h ago",
    unread: 0,
    online: false,
    type: "GROUP",  },
  // Add more conversations as needed
];

export function ConversationList({ activeTab }: { activeTab: string }) {
  return (
    <div
      className="space-y-1 overflow-y-auto"
      style={{ height: "calc(100vh - 160px)" }}
    >
      {conversations.map((conversation) => (
        conversation.type === activeTab && (        
        <div
          key={conversation.id}
          className="rounded-lg hover:bg-purple-500/10 cursor-pointer transition-all duration-200 GROUP border border-transparent hover:border-purple-500/20"
        >
          <div className="px-4 py-3 hover:bg-purple-500/20  cursor-pointer transition-all GROUP w-full flex items-center gap-3">
            <div className="relative">
              <Avatar className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-teal-300 font-medium border-2 border-slate-800">
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {conversation.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h4 className="font-medium text-purple-100 GROUP-hover:text-teal-300 transition-colors truncate">
                  {conversation.name}
                </h4>
                <span className="text-xs text-purple-400">
                  {conversation.time}
                </span>
              </div>
              <p className="text-sm text-purple-400 truncate">
                {conversation.lastMessage}
              </p>
            </div>
            {conversation.unread > 0 && (
              <Badge variant="default" className="ml-auto">
                {conversation.unread > 99 ? "99+" : conversation.unread}
              </Badge>
            )}
          </div>
          <Separator key={(conversation.id + 1).toString()} />
        </div>
      )))}
    </div>
  );
}
