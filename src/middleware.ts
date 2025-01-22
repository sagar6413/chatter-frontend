// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define our route configuration
// export const config = {
//   matcher: ["/", "/notifications", "/settings", "/signin", "/signup"],
// };
export const config = {
  matcher: ["/notifications"],
};

// Define auth-related routes
const publicRoutes = ["/signin", "/signup"];
const authRoutes = publicRoutes.map((route) => new RegExp(`^${route}$`));

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get stored tokens
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  // Check if the current route is a public route
  const isPublicRoute = authRoutes.some((route) => route.test(pathname));

  // Handle public routes (signin, signup)
  if (isPublicRoute) {
    // Redirect to home if user is already authenticated
    if (accessToken) {
      console.log("redirecting to home");
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Allow access to public routes if no token exists
    console.log("next response");
    return NextResponse.next();
  }

  // Handle protected routes
  if (!accessToken) {
    // If no access token but refresh token exists, try to refresh
    if (refreshToken) {
      try {
        console.log("refreshing token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/refresh-token`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          }
        );

        if (!response.ok) {
          // Clear the invalid refresh token
          const response = NextResponse.redirect(
            new URL("/signin", request.url)
          );
          response.cookies.delete("refresh_token");
          console.log("invalid refresh token");
          return response;
        }

        if (response.ok) {
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await response.json();

          // Clone the response to modify headers
          const nextResponse = NextResponse.next();

          // Set new tokens as cookies
          nextResponse.cookies.set("access_token", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60, // 15 minutes
          });

          nextResponse.cookies.set("refresh_token", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60, // 7 days
          });
          console.log("refresh token success");
          console.log(nextResponse.cookies);
          return nextResponse;
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        const response = NextResponse.redirect(new URL("/signin", request.url));
        response.cookies.delete("refresh_token");
        return response;
      }
    }

    console.log("no refresh token");
    // If refresh failed or no refresh token exists, redirect to signin
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  console.log("no access token");
  // For all other cases, proceed with the request
  return NextResponse.next();
}
