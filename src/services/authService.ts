import { useUserStore } from "@/store/userStore";
import { AuthenticationResponse, SignInRequest, SignUpRequest } from "@/types";
import { api } from "@/util/axiosInstance";
import { clearTokens, setTokens } from "@/util/cookieHandler";
import { AxiosError } from "axios";

export const signIn = async (data: SignInRequest) => {
  try {
    const authenticationResponse = await api.post<AuthenticationResponse>(
      "/auth/signin",
      data,
      { skipAuth: true }
    );
    setTokens(
      authenticationResponse.accessToken,
      authenticationResponse.refreshToken
    );
    const { setUser } = useUserStore();
    await setUser();
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing in:", error.response?.data);
    } else {
      console.error("Error signing in:", error);
    }
  }
};
export const signUp = async (data: SignUpRequest) => {
  try {
    const authenticationResponse = await api.post<AuthenticationResponse>(
      "/auth/signup",
      data,
      { skipAuth: true }
    );
    setTokens(
      authenticationResponse.accessToken,
      authenticationResponse.refreshToken
    );
    const { setUser } = useUserStore();
    await setUser();
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing up:", error.response?.data);
    } else {
      console.error("Error signing up:", error);
    }
  }
};
export const signOut = async () => {
  try {
    await api.post("/auth/signout");
    clearTokens();
    const { clearUser } = useUserStore();
    clearUser();
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error("Error signing out:", error.response?.data);
    } else {
      console.error("Error signing out:", error);
    }
  }
};
