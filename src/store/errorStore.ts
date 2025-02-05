import { ApiError } from "@/types/errors";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ErrorState {
  errors: ApiError[];
  maxErrors: number;
  errorCount: number;
  hasUnreadErrors: boolean;
  addError: (error: ApiError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
  markErrorsAsRead: () => void;
}

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set) => ({
      errors: [],
      maxErrors: 10,
      errorCount: 0,
      hasUnreadErrors: false,
      addError: (error) =>
        set((state) => {
          let updatedErrors = [...state.errors, error];
          if (updatedErrors.length > state.maxErrors) {
            updatedErrors = updatedErrors.slice(1);
          }
          return {
            errors: updatedErrors,
            errorCount: updatedErrors.length,
            hasUnreadErrors: true,
          };
        }),
      removeError: (index) =>
        set((state) => ({
          errors: state.errors.filter((_, i) => i !== index),
          errorCount: state.errors.length - 1,
        })),
      clearErrors: () =>
        set({
          errors: [],
          errorCount: 0,
          hasUnreadErrors: false,
        }),
      markErrorsAsRead: () => set({ hasUnreadErrors: false }),
    }),
    { name: "error-store" }
  )
);
