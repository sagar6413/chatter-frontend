import { getTime } from "@/util/dateTimeUtils";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Separator } from "@radix-ui/react-separator";
import { UserStatus } from "@/types";

export function ConversationItem({
  avatar,
  fallbackText,
  displayName,
  status,
  createdAt,
  lastMessage,
  onClick,
}: {
  avatar: string;
  fallbackText: string;
  displayName: string;
  status?: UserStatus;
  createdAt: Date;
  lastMessage: string;
  onClick: () => void;
}) {
  return (
    <div
      className="rounded-lg hover:bg-purple-500/10 cursor-pointer transition-all duration-200 GROUP border border-transparent hover:border-purple-500/20"
      onClick={onClick}
    >
      <div className="px-4 py-3 hover:bg-purple-500/20 cursor-pointer transition-all GROUP w-full flex items-center gap-3">
        <div className="relative">
          <Avatar className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-purple-500 flex items-center justify-center text-teal-300 font-medium border-2 border-slate-800">
            <AvatarImage src={avatar} />
            <AvatarFallback>{fallbackText}</AvatarFallback>
          </Avatar>
          {status && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-purple-100 GROUP-hover:text-teal-300 transition-colors truncate">
              {displayName}
            </h4>
            <span className="text-xs text-purple-400">
              {getTime(createdAt)}
            </span>
          </div>
          <p className="text-sm text-purple-400 truncate">{lastMessage}</p>
        </div>
        {/* {conversation.unread > 0 && (
                    <Badge variant="default" className="ml-auto">
                      {conversation.unread > 99 ? "99+" : conversation.unread}
                    </Badge>
                  )} */}
      </div>
      <Separator />
    </div>
  );
}
