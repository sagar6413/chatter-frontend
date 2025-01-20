"use client"
import { Component, ErrorInfo, ReactNode } from "react";
import { useErrorStore } from "@/store/errorStore";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorStore = useErrorStore.getState();
    errorStore.addError({
      type: "react:error",
      title: "React Component Error",
      status: 500,
      detail: error.message,
      timestamp: new Date().toISOString(),
      properties: {
        componentStack: errorInfo.componentStack,
        stack: error.stack,
        name: error.name,
      },
    });
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="error-boundary p-4 rounded-lg bg-red-50 border border-red-200">
            <h2 className="text-lg font-semibold text-red-700">
              Something went wrong
            </h2>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
