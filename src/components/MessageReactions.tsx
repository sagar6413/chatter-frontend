//--message-reactions.tsx
"use client";

import { ReactionResponse, ReactionType } from "@/types";

const REACTION_EMOJIS: Record<ReactionType, string> = {
  LIKE: "👍",
  LOVE: "❤️",
  HAHA: "😄",
  WOW: "😮",
  SAD: "😢",
  ANGRY: "😠",
};

export function MessageReactions({
  reactions,
}: {
  reactions: ReactionResponse[];
}) {
  // Group reactions by type and count them
  const reactionCounts = reactions.reduce((acc, reaction) => {
    const count = (acc[reaction.type] || 0) + 1;
    return { ...acc, [reaction.type]: count };
  }, {} as Record<ReactionType, number>);

  const totalReactionCount = Object.values(reactionCounts).reduce(
    (acc, count) => acc + count,
    0
  );

  return (
    <div
      className={`flex items-center w-fit  bg-[rgba(139,92,246,0.6)] hover:bg-[rgba(139,92,246,0.2)] px-2 py-0.5 rounded-full cursor-pointer transition-colors`}
    >
      {(Object.entries(reactionCounts) as [ReactionType, number][]).map(
        ([type, count]) =>
          count > 0 && (
            <div
              key={type}
              title={reactions
                .filter((r) => r.type === type)
                .map((r) => r.displayName)
                .join(", ")}
            >
              <span className="text-sm">{REACTION_EMOJIS[type]}</span>
            </div>
          )
      )}
      <span className="text-xs text-gray-400 ml-1">{totalReactionCount}</span>
    </div>
  );
}
