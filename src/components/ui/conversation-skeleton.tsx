import { Skeleton } from "./skeleton";

export function ConversationItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-slate-700/50 transition-colors">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[120px]" />
          <Skeleton className="h-3 w-[40px]" />
        </div>
        <Skeleton className="h-3 w-[200px]" />
      </div>
    </div>
  );
}

export function ConversationListSkeleton() {
  return (
    <div className="space-y-1">
      {Array.from({ length: 8 }).map((_, i) => (
        <ConversationItemSkeleton key={i} />
      ))}
    </div>
  );
}
