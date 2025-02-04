// user-profile-header.tsx
"use client";

import { UserStatus } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { memo } from "react";
import { Button } from "./ui/button";
import { FaCog, FaBell, FaSignOutAlt } from "react-icons/fa";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { signOut } from "@/mock/api";
import { useRouter } from "next/navigation";

// Type definition for props
interface UserProfileHeaderProps {
  displayName: string;
  avatar: string;
  status?: UserStatus;
}

// Memoized component to prevent unnecessary re-renders
export const UserProfileHeader = memo(function UserProfileHeader({
  displayName,
  avatar,
  status,
}: UserProfileHeaderProps) {
  const initials = displayName
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();

  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();
  const handleLogout = () => {
    signOut();
    router.push("/signin");
  };

  return (
    <header className="p-4 border-b border-purple-500/20 bg-gradient-to-r from-purple-900/50 via-slate-800/30 to-transparent backdrop-blur-lg supports-[backdrop-filter]:bg-slate-800/30 flex items-center justify-between">
      {/* Left Section - User Info */}
      <div className="flex items-center gap-3 flex-1">
        {/* Avatar with Status Indicator */}
        <div className="relative group">
          <Avatar
            className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-teal-500  border-[1.5px] border-transparent hover:border-purple-500/50 transition-all duration-300"
            aria-label={`${displayName}'s profile picture`}
          >
            <AvatarImage
              src={avatar}
              alt={displayName}
              className="rounded-full object-cover"
            />
            <AvatarFallback
              className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-purple-300 font-medium"
              title={displayName} // Show full name on hover
            >
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Status Indicator with ARIA */}
          {status && status === UserStatus.ONLINE && (
            <div
              className="absolute bottom-0 right-0.5 w-2.5 h-2.5 bg-teal-400 rounded-full border-2 border-slate-900 animate-pulse"
              role="status"
              aria-label="Online status"
            />
          )}
          {status && status === UserStatus.OFFLINE && (
            <div
              className="absolute bottom-0 right-0.5 w-2.5 h-2.5 bg-gray-400 rounded-full border-2 border-slate-900 animate-pulse"
              role="status"
              aria-label="Offline status"
            />
          )}
          {status && status === UserStatus.BUSY && (
            <div
              className="absolute bottom-0 right-0.5 w-2.5 h-2.5 bg-red-400 rounded-full border-2 border-slate-900 animate-pulse"
              role="status"
              aria-label="Busy status"
            />
          )}
          {status && status === UserStatus.AWAY && (
            <div
              className="absolute bottom-0 right-0.5 w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-slate-900 animate-pulse"
              role="status"
              aria-label="Away status"
            />
          )}
        </div>

        {/* User Name */}
        <h1 className="font-semibold text-purple-100 text-lg leading-tight truncate max-w-[200px]">
          {displayName}
        </h1>
      </div>

      {/* Right Section - Settings Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className=" ml-auto"
            aria-label="Settings"
            onClick={() => setIsOpen(!isOpen)}
          >
            <FaCog className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-48 bg-slate-800 border-slate-700"
          align="end"
          side="bottom"
        >
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
    </header>
  );
});
