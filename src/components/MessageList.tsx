"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  FaRegClock,
  FaCheck,
  FaCheckDouble,
  FaRegThumbsUp,
  FaRegHeart,
  FaRegLaughBeam,
  FaRegMeh,
  FaRegFrown,
  FaRegAngry,
  FaRegSmile,
} from "react-icons/fa";
import { useCallback, useEffect, useMemo, useState, useRef, memo } from "react";
import {
  defaultReactions,
  MessageDeliveryStatusResponse,
  MessageStatus,
  Theme,
  ConversationType,
  UserStatus,
  ReactionType,
  MessageResponse,
} from "@/types";
import { getTime } from "@/util/dateTimeUtils";
import { Button } from "./ui/button";
import { MessageListSkeleton } from "./ui/message-skeleton";
import cx from "clsx";
import { MessageReactions } from "./MessageReactions";
import { motion } from "framer-motion";
import { useChatActions } from "@/store/selectors";
import { useChat } from "@/hooks/useChat";
import { useDebounce } from "@/hooks/useDebounce";

export interface MessageListProps {
  conversationId: number;
  conversationType: ConversationType;
}

interface MessageProps {
  message: MessageResponse;
  onHover: (messageId: number) => void;
  onLeave: () => void;
  onReaction: (messageId: number, reaction: string) => void;
  onToggleReactions: (messageId: number) => void;
  openReactionId: number | null;
  pickerRef: React.RefObject<HTMLDivElement | null>;
}

const Message = memo(function Message({
  message,
  onHover,
  onLeave,
  onReaction,
  onToggleReactions,
  openReactionId,
  pickerRef,
}: MessageProps) {
  const messageDeliveryStatusIcon = useCallback(
    (messageDeliveryStatusResponse: MessageDeliveryStatusResponse) => {
      switch (messageDeliveryStatusResponse.status) {
        case MessageStatus.NOT_SENT:
          return <FaRegClock className="w-4 h-4 text-gray-400" />;
        case MessageStatus.SENT:
          return <FaCheck className="w-4 h-4 text-purple-400" />;
        case MessageStatus.DELIVERED:
          return <FaCheckDouble className="w-4 h-4 text-purple-400" />;
        case MessageStatus.READ:
          return <FaCheck className="w-4 h-4 text-teal-400" />;
        default:
          return null;
      }
    },
    []
  );

  const showReactionPicker = useCallback((reaction: string) => {
    switch (reaction) {
      case "LIKE":
        return <FaRegThumbsUp className="w-4 h-4 text-yellow-300" />;
      case "LOVE":
        return <FaRegHeart className="w-4 h-4 text-red-300" />;
      case "HAHA":
        return <FaRegLaughBeam className="w-4 h-4 text-yellow-300" />;
      case "WOW":
        return <FaRegMeh className="w-4 h-4 text-yellow-300" />;
      case "SAD":
        return <FaRegFrown className="w-4 h-4 text-yellow-300" />;
      case "ANGRY":
        return <FaRegAngry className="w-4 h-4 text-yellow-300" />;
      default:
        return null;
    }
  }, []);

  const messageDeliveryStatusIconChecker = useCallback(
    (deliveryStatuses: Set<MessageDeliveryStatusResponse>) => {
      const statusArray = Array.from(deliveryStatuses);

      if (statusArray.length === 1) {
        return messageDeliveryStatusIcon(statusArray[0]);
      }

      const allStatuses = statusArray.map((status) => status.status);

      if (allStatuses.every((status) => status === MessageStatus.READ)) {
        return <FaCheck className="w-2 h-2 text-teal-400" />;
      }

      const hasRead = allStatuses.some(
        (status) => status === MessageStatus.READ
      );
      const allDeliveredOrRead = allStatuses.every(
        (status) =>
          status === MessageStatus.DELIVERED || status === MessageStatus.READ
      );
      if (hasRead && allDeliveredOrRead) {
        return <FaCheck className="w-3 h-3 text-purple-400" />;
      }

      const someRead = allStatuses.some(
        (status) => status === MessageStatus.READ
      );
      const someDelivered = allStatuses.some(
        (status) => status === MessageStatus.DELIVERED
      );
      const allSentOrBetter = allStatuses.every(
        (status) =>
          status === MessageStatus.SENT ||
          status === MessageStatus.DELIVERED ||
          status === MessageStatus.READ
      );

      if (someRead && someDelivered && allSentOrBetter) {
        return <FaCheck className="w-3 h-3 text-purple-400" />;
      }

      if (allStatuses.every((status) => status === MessageStatus.NOT_SENT)) {
        return <FaRegClock className="w-3 h-3 text-gray-400" />;
      }

      return messageDeliveryStatusIcon(statusArray[0]);
    },
    [messageDeliveryStatusIcon]
  );

  return (
    <motion.div
      key={message.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex items-start gap-3 group ",
        message.senderUsername === "current-user"
          ? "justify-end"
          : "justify-start"
      )}
      onMouseEnter={() => onHover(message.id)}
      onMouseLeave={onLeave}
    >
      <div className="relative max-w-[80%] min-w-[60%] my-1.5 ">
        <div className="flex items-start gap-2.5">
          {message.senderUsername !== "current-user" && (
            <Avatar className="h-9 w-9 border-2 border-purple-600/20 hover:border-purple-500/40 transition-colors">
              {message.senderAvatarUrl ? (
                <AvatarImage
                  src={message.senderAvatarUrl}
                  alt={message.senderDisplayName}
                />
              ) : (
                <AvatarFallback>
                  {message.senderDisplayName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            className={cx(
              "relative min-w-[40%] rounded-2xl pt-2 pb-4 pl-4 pr-2 shadow-lg",
              message.senderUsername === "current-user"
                ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white ml-12 rounded-br-sm"
                : "bg-slate-800 border border-slate-700/60 mr-12 rounded-bl-sm",
              "hover:shadow-xl transition-all duration-200 "
            )}
          >
            <p className="text-[15px] leading-snug tracking-wide">
              {message.content}
            </p>

            <span
              className={`absolute text-xs font-medium text-purple-100/70
              ${
                message.senderUsername === "current-user"
                  ? "left-6 bottom"
                  : "right-6 bottom"
              }
              `}
            >
              {getTime(new Date(message.timestamp))}
            </span>
            {message.senderUsername === "current-user" && (
              <div className="absolute flex items-center gap-1 left-20 bottom-0.5">
                {message.deliveryStatus.length > 0 &&
                  messageDeliveryStatusIconChecker(
                    new Set(
                      message.deliveryStatus.map((status) => ({
                        ...status,
                        messageDeliveryStatusId: Math.random(),
                        statusTimestamp: new Date(),
                        recipient: {
                          ...status.recipient,
                          id: 0,
                          displayName: status.recipient.username,
                          avatar: "",
                          status: UserStatus.ONLINE,
                          lastSeenAt: new Date(),
                          createdAt: new Date(),
                          preferences: {
                            notificationEnabled: false,
                            theme: Theme.DARK,
                          },
                        },
                      }))
                    )
                  )}
              </div>
            )}

            {/* Reactions section */}
            <div
              className={cn(
                "absolute flex gap-1.5",
                message.senderUsername === "current-user"
                  ? "right-3 -bottom-4"
                  : "left-3 -bottom-4"
              )}
            >
              {message.reactions.length > 0 && (
                <MessageReactions reactions={Array.from(message.reactions)} />
              )}
            </div>

            {/* Message tail */}
            <div
              className={cn(
                "absolute -bottom-[2px] w-2 h-2 rotate-45 transition-all",
                "origin-center hover:scale-110",
                message.senderUsername === "current-user"
                  ? "-right-1 bg-indigo-600"
                  : "-left-1 bg-slate-800 border-l border-b border-slate-700/60"
              )}
            />
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "w-7 h-7 rounded-full bg-slate-800/50 backdrop-blur-lg border border-slate-700/60",
                "hover:bg-purple-600/30 hover:border-purple-500/40",
                "transition-all duration-200 scale-90 opacity-1 group-hover:scale-100 group-hover:opacity-100",
                "absolute",
                message.senderUsername === "current-user"
                  ? "-left-2 -bottom-2"
                  : "-right-2 -bottom-2"
              )}
              onClick={(e) => {
                e.stopPropagation();
                onToggleReactions(message.id);
              }}
              data-reaction-trigger
              aria-label="Show reactions"
            >
              <FaRegSmile className="w-4 h-4 text-purple-400 hover:text-purple-300" />
            </Button>
          </motion.div>
        </div>

        {/* Reaction picker */}
        {openReactionId === message.id && (
          <motion.div
            ref={pickerRef}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "absolute flex p-1 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-lg",
              "rounded-2xl border border-slate-700/60 shadow-2xl shadow-slate-950/60",
              message.senderUsername === "current-user"
                ? " -left-4 -top-4 "
                : "-right-4 -top-4 "
            )}
          >
            {defaultReactions.map((reaction) => (
              <motion.div
                key={reaction}
                whileHover={{ scale: 1, y: -5 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative w-9 h-9 rounded-full bg-transparent hover:bg-purple-500/20 
                           transition-[transform,background-color] duration-200 group"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReaction(message.id, reaction);
                  }}
                  aria-label={reaction}
                >
                  <motion.span
                    className="block text-lg transform-gpu"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                  >
                    {showReactionPicker(reaction)}
                  </motion.span>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
});

function MessageList({ conversationId, conversationType }: MessageListProps) {
  const [openReactionId, setOpenReactionId] = useState<number | null>(null);
  const pickerRef = useRef<HTMLDivElement | null>(null);
  const { messages, markAsRead } = useChat(conversationId, conversationType);
  const { addReaction } = useChatActions();
  const [hoveredMessageId, setHoveredMessageId] = useState<number | null>(null);
  const debouncedHoveredMessageId = useDebounce(hoveredMessageId, 300);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (pickerRef.current?.contains(target)) return;
    setOpenReactionId(null);
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    if (debouncedHoveredMessageId !== null) {
      const message = messages.find(
        (msg) => msg.id === debouncedHoveredMessageId
      );
      if (
        message &&
        !message.deliveryStatus.some(
          (status) => status.status === MessageStatus.READ
        )
      ) {
        markAsRead(debouncedHoveredMessageId);
      }
    }
  }, [debouncedHoveredMessageId, messages, markAsRead]);

  const handleMessageHover = useCallback((messageId: number) => {
    setHoveredMessageId(messageId);
  }, []);

  const handleMessageLeave = useCallback(() => {
    setHoveredMessageId(null);
  }, []);

  const handleReaction = useCallback(
    (messageId: number, reaction: string) => {
      addReaction(conversationId, messageId, {
        id: Date.now(),
        username: "current-user",
        displayName: "Current User",
        avatarUrl: "",
        type: reaction as ReactionType,
      });
      setOpenReactionId(null);
    },
    [conversationId, addReaction]
  );

  const toggleReactions = useCallback((messageId: number) => {
    setOpenReactionId((prev) => (prev === messageId ? null : messageId));
  }, []);

  const memoizedMessages = useMemo(
    () =>
      messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          onHover={handleMessageHover}
          onLeave={handleMessageLeave}
          onReaction={handleReaction}
          onToggleReactions={toggleReactions}
          openReactionId={openReactionId}
          pickerRef={pickerRef}
        />
      )),
    [
      messages,
      handleMessageHover,
      handleMessageLeave,
      handleReaction,
      toggleReactions,
      openReactionId,
    ]
  );

  if (messages.length === 0) {
    return (
      <ScrollArea className="h-full">
        <MessageListSkeleton />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="flex flex-col p-4 gap-4">{memoizedMessages}</div>
    </ScrollArea>
  );
}

export default memo(MessageList);
