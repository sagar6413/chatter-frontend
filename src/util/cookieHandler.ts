// src/util/cookieHandler.ts
import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/types/index";

// Get access token (Server Component utility)
export const getAccessToken =async () => {
  const cookieStore =await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
};

// Get refresh token (Server Component utility)
export const getRefreshToken = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
};

// Clear tokens (Server Component utility)
export const clearTokens = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
};
