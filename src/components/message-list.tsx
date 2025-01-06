"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck } from "lucide-react";
import { MessageReactions } from "./message-reactions";
import { useState } from "react";
import { ReactionPicker } from "./reaction-picker";
import { Message, defaultReactions } from "@/types";

export function MessageList() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      content: "Hey! How are you?",
      sender: "other",
      senderId: 1,
      createdAt: "10:00 AM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      senderName: "Alice",
      reactions: [
        { emoji: "👍", count: 2 },
        { emoji: "😊", count: 1 },
      ],
      status: "read",
    },
    {
      id: 2,
      content: "I'm doing great, thanks! How about you?",
      sender: "other",
      senderId: 2,
      createdAt: "10:02 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "❤️", count: 3 }],
      status: "read",
    },
    {
      id: 3,
      content: "Not bad at all. Just busy with work.",
      sender: "other",
      senderId: 1,
      createdAt: "10:05 AM",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      senderName: "Alice",
      reactions: [{ emoji: "😅", count: 1 }],
      status: "read",
    },
    {
      id: 4,
      content: "Yeah, work has been crazy here too!",
      sender: "other",
      senderId: 2,
      createdAt: "10:07 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [
        { emoji: "💪", count: 2 },
        { emoji: "🔥", count: 1 },
      ],
      status: "read",
    },
    {
      id: 5,
      content: "By the way, did you finish the report?",
      sender: "other",
      senderId: 1,
      createdAt: "10:10 AM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      senderName: "Alice",
      reactions: [],
      status: "delivered",
    },
    {
      id: 6,
      content: "Almost done! Just need to proofread it.",
      sender: "other",
      senderId: 2,
      createdAt: "10:12 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "👍", count: 1 }],
      status: "read",
    },
    {
      id: 7,
      content: "Awesome! Let me know if you need help.",
      sender: "other",
      senderId: 1,
      createdAt: "10:15 AM",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      senderName: "Alice",
      reactions: [{ emoji: "😊", count: 1 }],
      status: "read",
    },
    {
      id: 8,
      content: "Will do, thanks!",
      sender: "other",
      senderId: 2,
      createdAt: "10:17 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "🙌", count: 2 }],
      status: "read",
    },
    {
      id: 9,
      content: "Oh, did you hear about the new project?",
      sender: "other",
      senderId: 1,
      createdAt: "10:20 AM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      senderName: "Alice",
      reactions: [{ emoji: "🤔", count: 1 }],
      status: "delivered",
    },
    {
      id: 10,
      content: "Yeah! It sounds exciting.",
      sender: "other",
      senderId: 2,
      createdAt: "10:22 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [
        { emoji: "🔥", count: 3 },
        { emoji: "🎉", count: 1 },
      ],
      status: "read",
    },
    {
      id: 11,
      content: "We're going to be busy for a while, though.",
      sender: "other",
      senderId: 1,
      createdAt: "10:25 AM",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      senderName: "Alice",
      reactions: [{ emoji: "😅", count: 2 }],
      status: "read",
    },
    {
      id: 12,
      content: "True, but it'll be worth it!",
      sender: "other",
      senderId: 2,
      createdAt: "10:27 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "💪", count: 1 }],
      status: "read",
    },
    {
      id: 13,
      content: "Do you think we need more team members?",
      sender: "other",
      senderId: 1,
      createdAt: "10:30 AM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      senderName: "Alice",
      reactions: [{ emoji: "🤔", count: 1 }],
      status: "sent",
    },
    {
      id: 14,
      content:
        "Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting. Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.Probably, I'll suggest it in the next meeting.",
      sender: "other",
      senderId: 2,
      createdAt: "10:32 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "👍", count: 2 }],
      status: "read",
    },
    {
      id: 15,
      content: "Good idea! Let's see what the boss says.",
      sender: "other",
      senderId: 1,
      createdAt: "10:35 AM",
      avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12",
      senderName: "Alice",
      reactions: [{ emoji: "😊", count: 1 }],
      status: "delivered",
    },
    {
      id: 16,
      content: "Alright, talk to you later!",
      sender: "other",
      senderId: 2,
      createdAt: "10:37 AM",
      avatar: "https://github.com/shadcn.png",
      senderName: "You",
      reactions: [{ emoji: "👋", count: 1 }],
      status: "sent",
    },
    {
      id: 17,
      content: "Sure thing. Have a good day!",
      sender: "other",
      senderId: 2,
      createdAt: "10:40 AM",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      senderName: "Alice",
      reactions: [],
      status: "delivered",
    },
  ]);

  const handleReaction = (messageId: number, emoji: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId) {
          const existingReaction = message.reactions.find(
            (r) => r.emoji === emoji
          );
          if (existingReaction) {
            // Toggle reaction
            return {
              ...message,
              reactions: message.reactions.map((r) =>
                r.emoji === emoji
                  ? {
                      ...r,
                      count: r.selected ? r.count - 1 : r.count + 1,
                      selected: !r.selected,
                    }
                  : r
              ),
            };
          } else {
            // Add new reaction
            return {
              ...message,
              reactions: [
                ...message.reactions,
                { emoji, count: 1, selected: true },
                ...defaultReactions
                  .filter(
                    (r) =>
                      r.emoji !== emoji &&
                      !message.reactions.find((mr) => mr.emoji === r.emoji)
                  )
                  .map((r) => ({ ...r, selected: false })),
              ],
            };
          }
        }
        return message;
      })
    );
  };

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                "flex items-start gap-2",
                message.sender === "self" && "flex-row-reverse space-x-reverse"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.avatar} />
                <AvatarFallback>{message.senderName[0]}</AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg p-3 min-w-[20%] max-w-[40%] relative",
                  message.sender === "self"
                    ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-purple-100">{message.content}</p>

                <div
                  className={`absolute -bottom-2 ${
                    message.sender === "self" ? "-left-2" : "-right-2"
                  }`}
                >
                  <ReactionPicker
                    reactions={defaultReactions}
                    onReactionSelect={(emoji) =>
                      handleReaction(message.id, emoji)
                    }
                  />
                </div>
                <div
                  className={`flex items-center mt-1 ${
                    message.sender === "self" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.reactions.length > 0 && (
                    <MessageReactions reactions={message.reactions} />
                  )}
                </div>
              </div>
            </div>
            {message.sender === "self" ? (
              <div className="flex  w-full items-center  justify-end gap-2  mt-1 pr-10">
                <span className="text-[10px] text-purple-400">
                  {message.createdAt}
                </span>
                {message.status === "read" && (
                  <>
                    <CheckCheck className="w-4 h-4 text-[#10B981]" />
                  </>
                )}
                {message.status === "delivered" && (
                  <>
                    <CheckCheck className="w-4 h-4 text-purple-400" />
                  </>
                )}
                {message.status === "sent" && (
                  <>
                    <Check className="w-4 h-4 text-purple-400" />
                  </>
                )}
              </div>
            ) : (
              <div className="flex  w-full items-center justify-start pl-10">
                <span className="text-[10px] text-purple-400 mt-1">
                  {message.createdAt}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
