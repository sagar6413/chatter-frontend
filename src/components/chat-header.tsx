"use client";

import { Phone, Video, MoreVertical, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function ChatHeader() {
  const status = 'Online';
  return (
    <div className="border-b  border-purple-500/20 bg-slate-800/50 backdrop-blur-xl flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 rounded-full bg-gradient-to-br from-[#2DD4BF] to-[#14B8A6] flex items-center justify-center text-white font-medium border-2 border-transparent hover:border-[rgba(139,92,246,0.5)] transition-all"> 
          <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" />
          <AvatarFallback>AJ</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium text-purple-100 text-lg">Alice Johnson</h3>
          <div className="flex items-center space-x-1">
            {
              status === 'Online' ? (<><Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                <span className="text-sm text-teal-400">Connected</span></>) : (
                  <>
                    <Radio className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-400">Disconnected</span>
                  </>
                )
            }
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4 text-purple-400">
        <Button variant="ghost" size="icon">
          <Phone className="w-5 h-5  hover:text-purple-100 transition-colors cursor-pointer" />
        </Button>
        <Button variant="ghost" size="icon">
          <Video className="w-5 h-5  hover:text-purple-100 transition-colors cursor-pointer" />
        </Button>
        <Button variant="ghost" size="icon">
          <MoreVertical className="w-5 h-5  hover:text-purple-100 transition-colors cursor-pointer" />
        </Button>
      </div>
    </div>
  );
}
