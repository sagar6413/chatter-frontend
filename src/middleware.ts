import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  // Public Routes: No authentication needed
  if (
    request.nextUrl.pathname.includes("/signin") ||
    request.nextUrl.pathname.includes("/signup")
  ) {
    if (accessToken && refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Protected Routes:
  if (!accessToken) {
    if (refreshToken) {
      // If there is refresh token but no access token
      // We will try to refresh it on the client side
      return NextResponse.next();
    } else {
      // No tokens: Redirect to sign-in
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/notifications", "/settings", "/signin", "/signup"], // Adjust paths as needed
};
