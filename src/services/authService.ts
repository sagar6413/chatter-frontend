import { AuthenticationResponse, SignInRequest, SignUpRequest } from "@/types";
import { api } from "@/util/apiUtil";
import { AxiosError } from "axios";

const setCookie = (
  name: string,
  value: string,
  options: Record<string, string | boolean | number | Date>
) => {
  const cookieOptions = Object.entries(options)
    .map(([key, value]) => `${key}=${value}`)
    .join("; ");
  document.cookie = `${name}=${value}; ${cookieOptions}`;
};

export const signIn = async (data: SignInRequest) => {
  try {
    const { accessToken, refreshToken } =
      await api.post<AuthenticationResponse>("/auth/signin", data, {
        skipAuth: true,
      });
    // Set access token with security options
    setCookie("accessToken", accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token with security options
    setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Authentication failed");
    }
    throw error;
  }
};
export const signUp = async (data: SignUpRequest) => {
  try {
    const { accessToken, refreshToken } =
      await api.post<AuthenticationResponse>("/auth/signup", data, {
        skipAuth: true,
      });
    // Set access token with security options
    setCookie("accessToken", accessToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 15 * 60, // 15 minutes
    });

    // Set refresh token with security options
    setCookie("refreshToken", refreshToken, {
      path: "/",
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Authentication failed");
    }
    throw error;
  }
};
export const signOut = async () => {
  try {
    await api.post("/auth/signout");
    // Clear cookies securely
    setCookie("accessToken", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    });

    setCookie("refreshToken", "", {
      path: "/",
      expires: new Date(0),
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      httpOnly: true,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message || "Signout failed");
    }
    throw error;
  }
};
