"use client";

interface MessageReactionsProps {
    reactions: Array<{
      emoji: string;
      count: number;
    }>;
  }
  
  export function MessageReactions({ reactions }: MessageReactionsProps) {
    return (
      <div className="flex gap-1 mt-1 w-full flex-wrap">
        {reactions.map(({ emoji, count }) => (
          count > 0 && (
          <div
            key={emoji}
            className="flex items-center gap-0.5 bg-[rgba(139,92,246,0.1)] hover:bg-[rgba(139,92,246,0.2)] px-2 py-0.5 rounded-full cursor-pointer transition-colors"
          >
            <span className="text-sm">{emoji}</span>
            <span className="text-xs text-gray-400">{count}</span>
          </div>
        )))}
      </div>
    );
  }