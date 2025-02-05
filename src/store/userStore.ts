//--./src/store/userStore.ts--
import {
  UserPreferenceRequest,
  UserRequest,
  UserResponse,
  Theme,
} from "@/types";
import { ApiError } from "@/types/errors";
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import Cookies from "js-cookie";
import { signOut } from "@/services/authService";
// import { getMe, updatePreferences, updateUser } from "@/services/userService";
import { getMe, updatePreferences, updateUser } from "@/mock/api";
import { useErrorStore } from "./errorStore";

interface UserState {
  user: UserResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  lastSyncTime: number | null;

  // Actions
  setUser: () => Promise<void>;
  updateUser: (user: UserRequest) => Promise<void>;
  clearUser: () => void;
  updatePreferences: (preferences: UserPreferenceRequest) => Promise<void>;
  syncUser: () => Promise<void>;

  // Selectors
  getTheme: () => Theme;
  getDisplayName: () => string;
  getAvatarUrl: () => string;
  getUserId: () => number | null;
}

const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutes

const INITIAL_STATE = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
  lastSyncTime: null,
};

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set, get) => ({
        ...INITIAL_STATE,

        setUser: async () => {
          set({ isLoading: true });
          try {
            const userResponse = await getMe();
            set({
              user: userResponse,
              isLoading: false,
              isAuthenticated: true,
              lastSyncTime: Date.now(),
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            // Handle auth error by signing out
            signOut();
            set({
              ...INITIAL_STATE,
              isLoading: false,
            });
          }
        },

        updateUser: async (user: UserRequest) => {
          set({ isLoading: true });
          try {
            const userResponse = await updateUser(user);
            set({
              user: userResponse,
              isLoading: false,
              lastSyncTime: Date.now(),
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        updatePreferences: async (preferences: UserPreferenceRequest) => {
          set({ isLoading: true });
          try {
            const userPreferenceResponse = await updatePreferences(preferences);
            set((state) => {
              if (!state.user) return { ...state, isLoading: false };
              return {
                ...state,
                user: {
                  ...state.user,
                  preferences: userPreferenceResponse,
                },
                isLoading: false,
                lastSyncTime: Date.now(),
              };
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            set({ isLoading: false });
          }
        },

        clearUser: () => {
          Cookies.remove("accessToken");
          Cookies.remove("refreshToken");
          set(INITIAL_STATE);
        },

        syncUser: async () => {
          const { lastSyncTime, isAuthenticated, isLoading } = get();
          if (
            !isAuthenticated ||
            isLoading ||
            (lastSyncTime && Date.now() - lastSyncTime < SYNC_INTERVAL)
          ) {
            return;
          }

          set({ isLoading: true });
          try {
            const userResponse = await getMe();
            set({
              user: userResponse,
              isLoading: false,
              lastSyncTime: Date.now(),
            });
          } catch (error) {
            useErrorStore.getState().addError(error as ApiError);
            if ((error as ApiError).status === 401) {
              signOut();
              set(INITIAL_STATE);
            } else {
              set({ isLoading: false });
            }
          }
        },

        // Selectors
        getTheme: () => get().user?.preferences.theme || Theme.SYSTEM,
        getDisplayName: () => get().user?.displayName || "Guest",
        getAvatarUrl: () => get().user?.avatar || "/default-avatar.png",
        getUserId: () => get().user?.id || null,
      }),
      {
        name: "user-store",
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: "UserStore" }
  )
);
