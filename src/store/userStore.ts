//--./src/store/userStore.ts--
import {
  UserPreferenceRequest,
  UserRequest,
  UserResponse,
} from "@/types/index";
import { create } from "zustand";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { signOut } from "@/services/authService";
// import { getMe, updatePreferences, updateUser } from "@/services/userService";
import { getMe, updatePreferences, updateUser } from "@/mock/api";

interface UserState {
  user: UserResponse | null;
  loading: boolean;
  setUser: () => Promise<void>;
  updateUser: (user: UserRequest) => Promise<void>;
  clearUser: () => void;
  updatePreferences: (preferences: UserPreferenceRequest) => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  loading: false,
  setUser: async () => {
    try {
      set({ loading: true });
      const userResponse = await getMe();
      set({ user: userResponse, loading: false });
    } catch (error) {
      // Handle error, maybe logout if auth error
      signOut();
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      set({ user: null, loading: false }); // Clear user data if fetch fails
    }
  },
  updateUser: async (user: UserRequest) => {
    try {
      set({ loading: true });
      const userResponse = await updateUser(user);
      set({ user: userResponse, loading: false });
    } catch (error) {
      // Handle error
      if (error instanceof AxiosError) {
        console.error("Error updating user:", error.response?.data);
      } else {
        console.error("Error updating user:", error);
      }
      set({ loading: false });
    }
  },
  updatePreferences: async (preferences: UserPreferenceRequest) => {
    try {
      set({ loading: true });
      const userPreferenceResponse = await updatePreferences(preferences);
      set((state) => {
        if (!state.user) return { ...state, loading: false };
        return {
          ...state, // Preserve all other state properties
          user: {
            ...state.user, // Preserve all user properties
            prefrences: userPreferenceResponse, // Update only preferences
          },
          loading: false,
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error updating preferences:", error.response?.data);
      } else {
        console.error("Error updating preferences:", error);
      }
      set({ loading: false });
    }
  },
  clearUser: () => {
    set({ user: null, loading: false });
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  },
}));
