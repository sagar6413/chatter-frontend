"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Check, CheckCheck, Timer } from "lucide-react";
import { MessageReactions } from "./MessageReactions";
import { useMessageStore } from "@/store/messageStore";
import { useEffect } from "react";
import { MessageStatus } from "@/types";
import { getTime } from "@/util/dateTimeUtils";
import Picker, { EmojiStyle } from "emoji-picker-react";

export function MessageList({
  conversationId,
  username,
}: {
  conversationId: number;
  username: string;
}) {
  const { conversations, loadInitialMessages } = useMessageStore();

  useEffect(() => {
    loadInitialMessages(conversationId);

    return () => {
      // Optional: Clear messages when leaving conversation
      // messageStore.clearMessages(conversationId);
    };
  }, [conversationId, loadInitialMessages]);

  const handleOnReactionClick = () => {};

  return (
    <ScrollArea className="flex-1 p-4">
      <div className="space-y-4">
        {conversations.get(conversationId)?.map((message) => (
          <div key={message.id}>
            <div
              className={cn(
                "flex items-start gap-2",
                message.senderUsername === username &&
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
                  message.senderUsername === username
                    ? "bg-gradient-to-r from-primary to-purple-500 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <p className="text-purple-100">{message.content}</p>

                <div
                  className={`absolute -bottom-2 ${
                    message.senderUsername === username ? "-left-2" : "-right-2"
                  }`}
                >
                  <Picker
                    reactionsDefaultOpen={true}
                    onReactionClick={handleOnReactionClick}
                    allowExpandReactions={false}
                    emojiStyle={EmojiStyle.GOOGLE}
                  />
                </div>
                <div
                  className={`flex items-center mt-1 ${
                    message.senderUsername === username
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
            {message.senderUsername === username ? (
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
