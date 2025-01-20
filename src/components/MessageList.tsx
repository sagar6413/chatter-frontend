"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Timer } from "lucide-react";
import { MessageReactions } from "./MessageReactions";
import { ReactionPicker } from "./ReactionPicker";
import { useMessageStore } from "@/store/messageStore";
import { useEffect, useState } from "react";
import {
  defaultReactions,
  MessageResponse,
  MessageStatus,
  UserResponse,
} from "@/types";
import { useUserStore } from "@/store/userStore";
import { signOut } from "@/services/authService";
import { getTime } from "@/util/dateTimeUtils";

export function MessageList({
  conversationId,
  user,
}: {
  conversationId: number;
  user: UserResponse;
}) {
  const {
    conversations,
    loading,
    loadingMore,
    loadInitialMessages,
    loadMoreMessages,
  } = useMessageStore();

  const [messages, setMessages] = useState<MessageResponse[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      await loadInitialMessages(conversationId);
      setMessages(conversations.get(conversationId) || []);
    };

    fetchMessages();

    return () => {
      // Optional: Clear messages when leaving conversation
      // messageStore.clearMessages(conversationId);
    };
  }, [conversationId, conversations, loadInitialMessages]);

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                "flex items-start gap-2",
                message.senderUsername === user.username &&
                  "flex-row-reverse space-x-reverse"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.senderAvatarUrl} />
                <AvatarFallback>
                  {message.senderDisplayName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "rounded-lg p-3 min-w-[20%] max-w-[40%] relative",
                  message.senderUsername === user.username
                    ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-purple-100">{message.content}</p>

                <div
                  className={`absolute -bottom-2 ${
                    message.senderUsername === user.username
                      ? "-left-2"
                      : "-right-2"
                  }`}
                >
                  <ReactionPicker
                    reactions={defaultReactions}
                    onReactionSelect={(emoji) =>
                      handleOnReactionSelect(message.id, emoji)
                    }
                  />
                </div>
                <div
                  className={`flex items-center mt-1 ${
                    message.senderUsername === user.username
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {Array.from(message.reactions).length > 0 && (
                    <MessageReactions
                      reactions={Array.from(message.reactions)}
                    />
                  )}
                </div>
              </div>
            </div>
            {message.senderUsername === user.username ? (
              <div className="flex  w-full items-center  justify-end gap-2  mt-1 pr-10">
                <span className="text-[10px] text-purple-400">
                  {getTime(message.createdAt)}
                </span>
                {message &&
                  Array.from(message.deliveryStatus).map(
                    (messageDeliveryStatus) => {
                      switch (messageDeliveryStatus.status) {
                        case MessageStatus.NOT_SENT:
                          return <Timer className="w-4 h-4 text-gray-400" />;
                        case MessageStatus.SENT:
                          return <Check className="w-4 h-4 text-purple-400" />;
                        case MessageStatus.DELIVERED:
                          <CheckCheck className="w-4 h-4 text-purple-400" />;
                        case MessageStatus.READ:
                          return <Check className="w-4 h-4 text-teal-400" />;
                        default:
                          return null;
                      }
                    }
                  )}
              </div>
            ) : (
              <div className="flex  w-full items-center justify-start pl-10">
                <span className="text-[10px] text-purple-400 mt-1">
                  {getTime(message.createdAt)}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
