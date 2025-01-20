import {
  UserPreferenceRequest,
  UserRequest,
  UserResponse,
} from "@/types/index";
import { create } from "zustand";
import Cookies from "js-cookie";
import { AxiosError } from "axios";
import { signOut } from "@/services/authService";
import { getMe, updatePreferences, updateUser } from "@/services/userService";

interface UserState {
  user: UserResponse | null;
  setUser: (user: UserResponse) => Promise<void>;
  updateUser: (user: UserRequest) => Promise<void>;
  clearUser: () => void;
  updatePreferences: (preferences: UserPreferenceRequest) => Promise<void>;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  setUser: async () => {
    try {
      const userResponse = await getMe();
      set({ user: userResponse });
    } catch (error) {
      // Handle error, maybe logout if auth error
      signOut();
      if (error instanceof AxiosError) {
        console.error("Error fetching user:", error.response?.data);
      } else {
        console.error("Error fetching user:", error);
      }
      set({ user: null }); // Clear user data if fetch fails
    }
  },
  updateUser: async (user: UserRequest) => {
    try {
      const userResponse = await updateUser(user);
      set({ user: userResponse });
    } catch (error) {
      // Handle error
      if (error instanceof AxiosError) {
        console.error("Error updating user:", error.response?.data);
      } else {
        console.error("Error updating user:", error);
      }
    }
  },
  updatePreferences: async (preferences: UserPreferenceRequest) => {
    try {
      const userPreferenceResponse = await updatePreferences(preferences);
      set((state) => {
        if (!state.user) return state;
        return {
          ...state, // Preserve all other state properties
          user: {
            ...state.user, // Preserve all user properties
            prefrences: userPreferenceResponse, // Update only preferences
          },
        };
      });
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error updating preferences:", error.response?.data);
      } else {
        console.error("Error updating preferences:", error);
      }
    }
  },
  clearUser: () => {
    set({ user: null });
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
  },
}));
