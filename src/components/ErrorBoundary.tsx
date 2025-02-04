"use client";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { useError } from "@/hooks/useError";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundaryInner extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.onError?.(error);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert variant="destructive" className="my-4">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "An unexpected error occurred"}
          </AlertDescription>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </Button>
        </Alert>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to access hooks
export function ErrorBoundary({ children, fallback }: Props) {
  const { handleError } = useError();

  return (
    <ErrorBoundaryInner
      fallback={fallback}
      onError={(error: Error) => handleError(error, "react")}
    >
      {children}
    </ErrorBoundaryInner>
  );
}
