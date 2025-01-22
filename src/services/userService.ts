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
    const userResponse = await api.get<UserResponse>("/me");
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};

export const getUser = async (username: string): Promise<UserResponse> => {
  try {
    const userResponse = await api.get<UserResponse>(`/username/${username}`);
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};

export const updateUser = async (user: UserRequest): Promise<UserResponse> => {
  try {
    const userResponse = await api.put<UserResponse>("/me", user);
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating user:", error.response?.data);
    } else {
      console.error("Error updating user:", error);
    }
    throw new Error("Error updating user");
  }
};

export const updatePreferences = async (
  preferences: UserPreferenceRequest
): Promise<UserPreferenceResponse> => {
  try {
    const userPreferenceResponse = await api.put<UserPreferenceResponse>(
      "/me/preferences",
      preferences
    );
    return userPreferenceResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error updating preferences:", error.response?.data);
    } else {
      console.error("Error updating preferences:", error);
    }
    throw new Error("Error updating preferences");
  }
};

export const searchUser = async (query: string): Promise<SearchResult> => {
  try {
    const userResponse = await api.get<SearchResult>(`/search?aquery=${query}`);
    return userResponse;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error fetching user:", error.response?.data);
    } else {
      console.error("Error fetching user:", error);
    }
    throw new Error("Error fetching user");
  }
};
