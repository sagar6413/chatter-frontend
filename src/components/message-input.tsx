"use client";

import {
  Paperclip,
  Smile,
  Send,
  FileText,
  BarChart2,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MessageInput() {
  return (
    <div className="border-t p-2 flex items-center gap-4 border-purple-500/20 bg-slate-800/50 backdrop-blur-lg">
      <div className="flex gap-1">
        <DropdownMenu>
          <TooltipProvider>
            <Tooltip>
              <DropdownMenuTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Photo/Video
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Document
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Poll
                </DropdownMenuItem>
              </DropdownMenuContent>
              <TooltipContent>Attach files</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </DropdownMenu>
      </div>
      <div className="flex-1 relative">
        <Textarea
          placeholder="Type a message..."
          className="w-full min-h-8 max-h-12 p-2 bg-slate-700/50 border border-purple-500/20 rounded-lg focus:outline-none focus:border-purple-500/40 text-purple-100 placeholder-purple-400 resize-none pr-12 py-3"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add emoji</TooltipContent>
        </Tooltip>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="bg-gradient-to-r from-purple-500 to-teal-500 text-white rounded-lg p-2 hover:opacity-90 transition-opacity"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
}
