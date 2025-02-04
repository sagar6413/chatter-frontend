"use client";
import { getTime } from "@/util/dateTimeUtils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "@radix-ui/react-separator";
import { UserStatus } from "@/types";
import { memo } from "react";

const StatusIndicator = memo(({ status }: { status: UserStatus }) => {
  const statusColor = {
    [UserStatus.ONLINE]: "bg-green-500",
    [UserStatus.OFFLINE]: "bg-gray-500",
    [UserStatus.BUSY]: "bg-red-500",
    [UserStatus.AWAY]: "bg-yellow-500",
  }[status];

  return (
    <span
      className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background ${statusColor}`}
      aria-label={`${status} status`}
    />
  );
});
StatusIndicator.displayName = "StatusIndicator";

const ConversationItem = memo(
  ({
    avatar,
    fallbackText,
    displayName,
    status,
    createdAt,
    lastMessage,
    onClick,
    isSelected,
  }: {
    avatar: string;
    fallbackText: string;
    displayName: string;
    status?: UserStatus;
    createdAt: Date;
    lastMessage: string;
    onClick: () => void;
    isSelected?: boolean;
  }) => {
    return (
      <div
        className={`
          group relative cursor-pointer border transition-all
          duration-200 hover:border-purple-500/20 hover:bg-purple-500/10
          ${
            isSelected
              ? "border-2 border-purple-500/60 bg-purple-500/50"
              : "border-1 border-transparent"
          }
        `}
        onClick={onClick}
        role="button"
        tabIndex={0}
        aria-label={`Conversation with ${displayName}`}
      >
        <div
          className={`
            flex w-full items-center gap-3 p-3 transition-colors
            ${!isSelected && "group-hover:bg-purple-500/20"}
          `}
        >
          <div className="relative shrink-0">
            <Avatar className="size-12 rounded-full border-2 border-slate-800 bg-gradient-to-br from-teal-500 to-purple-500">
              {avatar ? (
                <AvatarImage
                  src={avatar}
                  alt={displayName}
                  className="object-cover"
                />
              ) : (
                <AvatarFallback className="font-medium text-teal-300">
                  {fallbackText}
                </AvatarFallback>
              )}
            </Avatar>
            {status && <StatusIndicator status={status} />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h4 className="truncate font-medium text-purple-100 transition-colors group-hover:text-teal-300">
                {displayName}
              </h4>
              <time
                className="shrink-0 text-xs text-purple-400"
                dateTime={createdAt.toISOString()}
              >
                {getTime(createdAt)}
              </time>
            </div>
            <p className="truncate text-sm text-purple-300/80">{lastMessage}</p>
          </div>
        </div>
        <Separator className="bg-purple-500/20" />
      </div>
    );
  }
);
ConversationItem.displayName = "ConversationItem";

export { ConversationItem };
