"use client";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SmileIcon } from "lucide-react";


interface Reaction {
    emoji: string;
    count: number;
    selected?: boolean;
  }

interface ReactionPickerProps {
  onReactionSelect: (emoji: string) => void;
  reactions: Reaction[];
}

export function ReactionPicker({ onReactionSelect, reactions }: ReactionPickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-5 h-5 flex items-center justify-center rounded-full bg-[rgba(30,41,59,0.5)] backdrop-blur-xl border border-[rgba(139,92,246,0.2)] transition-colors group-hover:bg-[rgba(139,92,246,0.2)]"
        >
          <SmileIcon className="h-4 w-4 text-yellow-700" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-2" align="center">
        <div className="flex gap-1">
          {reactions.map((reaction) => (
            <Button
              key={reaction.emoji}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onReactionSelect(reaction.emoji)}
            >
              {reaction.emoji}
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}