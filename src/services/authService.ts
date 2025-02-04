//--./src/services/authService.ts--
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
    console.log("signing in");
    const { accessToken, refreshToken } =
      await api.post<AuthenticationResponse>("/users/auth/signin", data, {
        skipAuth: true,
      });
    setCookie("accessToken", accessToken, {
      path: "/",
      maxAge: 15 * 60,
    });

    setCookie("refreshToken", refreshToken, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Authentication error in signIn function in authService.ts",
      error
    );
    throw new Error("Authentication failed");
  }
};
export const signUp = async (data: SignUpRequest) => {
  try {
    console.log("signing up");
    const { accessToken, refreshToken } =
      await api.post<AuthenticationResponse>("/users/auth/signup", data, {
        skipAuth: true,
      });
    console.log("access token", accessToken);
    console.log("refresh token", refreshToken);

    setCookie("accessToken", accessToken, {
      path: "/",
      maxAge: 15 * 60,
    });

    setCookie("refreshToken", refreshToken, {
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Authentication error in signUp function in authService.ts",
      error
    );
    throw new Error("Authentication failed");
  }
};
export const signOut = async () => {
  try {
    await api.post("/users/auth/signout");

    setCookie("accessToken", "", {
      path: "/",
      httpOnly: true,
    });

    setCookie("refreshToken", "", {
      path: "/",
      httpOnly: true,
    });
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }
    console.error(
      "Authentication error in signOut function in authService.ts",
      error
    );
    throw new Error("Signout failed");
  }
};
