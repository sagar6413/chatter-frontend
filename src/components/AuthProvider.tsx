"use client";
import { createContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/util/cookieHandler";
import { AuthenticationResponse } from "@/types";
import { api } from "@/util/axiosInstance";
import { CustomRequestConfig } from "@/types/axios";

type AuthContextType = {
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = await getAccessToken();
      const refreshToken = await getRefreshToken();

      if (refreshToken && !accessToken) {
        // Attempt to refresh the token
        try {
          const newAccessToken = await refreshTokenOnClient();
          setIsAuthenticated(!!newAccessToken);
        } catch (error) {
          console.error("Failed to refresh token:", error);
          setIsAuthenticated(false);
          clearTokens();
          router.push("/signin");
        }
      } else {
        setIsAuthenticated(!!accessToken);
      }
    };

    initializeAuth();
  }, [router]);

  const refreshTokenOnClient = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;
    const API_CONFIG: CustomRequestConfig = {
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      retry: 3,
      retryDelay: 1000,
    };

    try {
      const response = await api.get<AuthenticationResponse>(
        `${API_CONFIG.baseURL}/refresh-token`,
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
          skipAuth: true,
        } as CustomRequestConfig
      );

      const { accessToken, refreshToken: newRefreshToken } = response;
      await setTokens(accessToken, newRefreshToken);

      return accessToken;
    } catch (error) {
      clearTokens();
      router.push("/signin");
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
