import { Skeleton } from "./skeleton";

export function InputSkeleton() {
  return (
    <div className="flex items-center gap-2 p-4 border-t border-purple-500/20">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-10 flex-1 rounded-full" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}
