"use client";

import { Phone, Video, MoreVertical, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserStatus } from "@/types";

export function ChatHeader({
  avatar,
  fallback,
  displayName,
  status,
}: {
  avatar: string;
  fallback: string;
  displayName: string;
  status?: UserStatus;
}) {
  const statusStyles = {
    [UserStatus.ONLINE]: { color: "text-teal-400", label: UserStatus.ONLINE },
    [UserStatus.OFFLINE]: { color: "text-gray-400", label: UserStatus.OFFLINE },
    [UserStatus.BUSY]: { color: "text-red-400", label: UserStatus.BUSY },
    [UserStatus.AWAY]: { color: "text-yellow-400", label: UserStatus.AWAY },
  };

  const currentStatus = status ? statusStyles[status] : null;

  return (
    <div className="border-b border-purple-500/20 bg-slate-800/50 backdrop-blur-xl flex items-center justify-between p-4">
      {/* Left Section: Avatar and Info */}
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#14B8A6] flex items-center justify-center text-white font-medium border-2 border-transparent hover:border-[rgba(139,92,246,0.5)] transition-all">
          <AvatarImage src={avatar} />
          <AvatarFallback>{fallback}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-purple-100 text-lg">{displayName}</h3>
          {currentStatus && (
            <div className="flex items-center space-x-1">
              <Radio
                className={`w-3 h-3 animate-pulse ${currentStatus.color}`}
              />
              <span className={`text-sm ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Actions */}
      <div className="flex items-center gap-4 text-purple-400">
        {["Phone", "Video", "MoreVertical"].map((icon) => (
          <Button key={icon} variant="ghost" size="icon">
            {icon === "Phone" && (
              <Phone className="w-5 h-5 hover:text-purple-100 transition-colors cursor-pointer" />
            )}
            {icon === "Video" && (
              <Video className="w-5 h-5 hover:text-purple-100 transition-colors cursor-pointer" />
            )}
            {icon === "MoreVertical" && (
              <MoreVertical className="w-5 h-5 hover:text-purple-100 transition-colors cursor-pointer" />
            )}
          </Button>
        ))}
      </div>
    </div>
  );
}
