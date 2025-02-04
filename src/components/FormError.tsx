import { XCircle } from "lucide-react";

interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className = "" }: FormErrorProps) {
  if (!error) return null;

  return (
    <div
      className={`flex items-center gap-2 text-destructive text-sm mt-1 ${className}`}
    >
      <XCircle className="h-4 w-4" />
      <span>{error}</span>
    </div>
  );
}
