//--./src/services/userService.ts--
import {
  SearchResult,
  UserPreferenceRequest,
  UserPreferenceResponse,
  UserRequest,
  UserResponse,
} from "@/types";
import { api } from "@/util/apiUtil";
import { AxiosError } from "axios";

export const getMe = async (): Promise<UserResponse> => {
  try {
    const userResponse = await api.get<UserResponse>("/users/me");
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error in userService.ts while fetching user:", error);
    throw new Error("Error while fetching user");
  }
};

export const getUser = async (username: string): Promise<UserResponse> => {
  try {
    const userResponse = await api.get<UserResponse>(
      `/users/username/${username}`
    );
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Error in userService.ts while fetching user by username:",
      error
    );
    throw new Error("Error in userService.ts while fetching user by username");
  }
};

export const updateUser = async (user: UserRequest): Promise<UserResponse> => {
  try {
    const userResponse = await api.put<UserResponse>("/users/me", user);
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error in userService.ts while updating user:", error);
    throw new Error("Error in userService.ts while updating user");
  }
};

export const updatePreferences = async (
  preferences: UserPreferenceRequest
): Promise<UserPreferenceResponse> => {
  try {
    const userPreferenceResponse = await api.put<UserPreferenceResponse>(
      "/users/me/preferences",
      preferences
    );
    return userPreferenceResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error in userService.ts while updating preferences:", error);
    throw new Error("Error in userService.ts while updating preferences");
  }
};

export const searchUser = async (query: string): Promise<SearchResult> => {
  try {
    const userResponse = await api.get<SearchResult>(`/search?aquery=${query}`);
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error("Error in userService.ts while searching user:", error);
    throw new Error("Error in userService.ts while searching user");
  }
};
