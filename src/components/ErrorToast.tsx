"use client";

import { useEffect, useCallback } from "react";
import { useError } from "@/hooks/useError";

import { ApiError } from "@/types/errors";
import { useToast } from "@/hooks/use-toast";

export function ErrorToast() {
  const { errors, hasUnreadErrors, markErrorsAsRead } = useError();
  const { toast } = useToast();

  const showErrorToast = useCallback(
    (error: ApiError) => {
      toast({
        variant: "destructive",
        title: error.title || "Error",
        description: error.detail || error.message,
        duration: 5000,
      });
    },
    [toast]
  );

  useEffect(() => {
    if (hasUnreadErrors && errors.length > 0) {
      const latestError = errors[errors.length - 1];
      showErrorToast(latestError);
      markErrorsAsRead();
    }
  }, [errors, hasUnreadErrors, markErrorsAsRead, showErrorToast]);

  return null;
}
