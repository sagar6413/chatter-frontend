"use client";

import { IoRadio } from "react-icons/io5";
import {
  FaPhone,
  FaVideo,
  FaEllipsisVertical,
  FaArrowLeft,
  FaBellSlash,
  FaTrashCan,
  FaGear,
} from "react-icons/fa6";
import { FaFileArchive, FaSignOutAlt } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeaderSkeleton } from "./ui/header-skeleton";
import {
  GroupConversationResponse,
  PrivateConversationResponse,
  UserStatus,
} from "@/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const statusStyles = {
  [UserStatus.ONLINE]: { color: "text-teal-400", label: UserStatus.ONLINE },
  [UserStatus.OFFLINE]: { color: "text-gray-400", label: UserStatus.OFFLINE },
  [UserStatus.BUSY]: { color: "text-red-400", label: UserStatus.BUSY },
  [UserStatus.AWAY]: { color: "text-yellow-400", label: UserStatus.AWAY },
} as const;

const UserStatusIndicator = ({ status }: { status: UserStatus }) => (
  <div className="flex items-center gap-1.5">
    <IoRadio
      className={`size-3 animate-pulse ${statusStyles[status].color}`}
      aria-hidden="true"
    />
    <span className={`text-sm ${statusStyles[status].color}`}>
      {statusStyles[status].label}
    </span>
  </div>
);

interface ChatHeaderProps {
  avatar: string;
  avatarFallback: string;
  displayName: string;
  status?: UserStatus;
  loading?: boolean;
  setSelectedConversation: (
    conversation: PrivateConversationResponse | GroupConversationResponse | null
  ) => void;
}

export const ChatHeader = memo(function ChatHeader({
  avatar,
  avatarFallback,
  displayName,
  status,
  loading,
  setSelectedConversation,
}: ChatHeaderProps) {
  if (loading) {
    return <HeaderSkeleton />;
  }

  return (
    <header className="sticky h-[10%] md:h-[15%] top-0 z-10 flex items-center justify-between p-2 md:p-4 bg-slate-800/80 backdrop-blur-xl border-b border-purple-500/20 supports-[backdrop-filter]:bg-slate-800/80">
      {/* User Info Section */}
      <div className="flex items-center gap-3">
        {/* Back button */}
        <Button
          variant="ghost"
          size="icon"
          className="size-8 md:hidden"
          aria-label="Back to conversations"
          onClick={() => setSelectedConversation(null)}
        >
          <FaArrowLeft className="h-5 w-5" />
        </Button>
        <Avatar className="size-12 border-2 border-transparent bg-gradient-to-br from-teal-400 to-teal-600 transition-colors hover:border-purple-500/50">
          <AvatarImage
            src={avatar}
            alt={displayName}
            className="object-cover"
          />
          <AvatarFallback className="font-medium text-white">
            {avatarFallback}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-lg font-medium leading-tight text-purple-100">
            {displayName}
          </h1>
          {status && <UserStatusIndicator status={status} />}
        </div>
      </div>

      {/* Action Buttons Section */}
      <nav aria-label="Chat controls">
        <div className="flex items-center gap-1.5">
          <TooltipProvider delayDuration={200}>
            {/* Audio Call */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:size-10"
                  aria-label="Start audio call"
                >
                  <FaPhone className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start audio call</TooltipContent>
            </Tooltip>

            {/* Video Call */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 md:size-10"
                  aria-label="Start video call"
                >
                  <FaVideo className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start video call</TooltipContent>
            </Tooltip>

            {/* More Options Dropdown */}
            <DropdownMenu>
              <Tooltip>
                <DropdownMenuTrigger asChild>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 md:size-10"
                      aria-label="More options"
                    >
                      <FaEllipsisVertical className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-[180px] bg-slate-800 border-purple-500/20">
                  <DropdownMenuItem className="focus:bg-slate-700/50">
                    <FaBellSlash className="h-4 w-4 mr-2" />
                    Mute notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700/50">
                    <FaFileArchive className="h-4 w-4 mr-2" />
                    Archive chat
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">
                    <FaTrashCan className="h-4 w-4 mr-2" />
                    Delete chat
                  </DropdownMenuItem>
                  <DropdownMenuItem className="focus:bg-slate-700/50">
                    <FaGear className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-400 focus:bg-red-500/10">
                    <FaSignOutAlt className="h-4 w-4 mr-2" />
                    Leave chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
                <TooltipContent>More Options</TooltipContent>
              </Tooltip>
            </DropdownMenu>
          </TooltipProvider>
        </div>
      </nav>
    </header>
  );
});
