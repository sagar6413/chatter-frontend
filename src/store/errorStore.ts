import { ApiError } from "@/types/errors";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ErrorState {
  errors: ApiError[];
  addError: (error: ApiError) => void;
  removeError: (index: number) => void;
  clearErrors: () => void;
}

export const useErrorStore = create<ErrorState>()(
  devtools(
    (set) => ({
      errors: [],
      addError: (error) =>
        set((state) => ({
          errors: [...state.errors, error],
        })),
      removeError: (index) =>
        set((state) => ({
          errors: state.errors.filter((_, i) => i !== index),
        })),
      clearErrors: () => set({ errors: [] }),
    }),
    { name: "error-store" }
  )
);
