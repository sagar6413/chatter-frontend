"use server";

import { cookies } from "next/headers";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@/types/index";
import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

type CookieOptions = Pick<
  ResponseCookie,
  | "expires"
  | "httpOnly"
  | "path"
  | "sameSite"
  | "secure"
  | "priority"
  | "domain"
>;

const cookieOptions: CookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: "strict",
  path: "/",
};

export const setTokens = async (accessToken: string, refreshToken: string) => {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, cookieOptions);
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, cookieOptions);
};
