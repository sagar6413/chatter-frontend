import { Loader2 } from "lucide-react";
import { ErrorState } from "./ErrorState";

interface LoadingErrorProps {
  isLoading: boolean;
  error?: Error | string;
  children: React.ReactNode;
  onRetry?: () => void;
  loadingText?: string;
}

export function LoadingError({
  isLoading,
  error,
  children,
  onRetry,
  loadingText = "Loading...",
}: LoadingErrorProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">{loadingText}</span>
      </div>
    );
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  return <>{children}</>;
}
