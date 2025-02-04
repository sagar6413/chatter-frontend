"use client";

import React from "react";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useUserStore } from "@/store/userStore";
// import { signIn } from "@/services/authService";
import { useState } from "react";
import {
  signIn,
  getGoogleOAuthUrl,
  getInstagramOAuthUrl,
  getTwitterOAuthUrl,
} from "@/mock/api";
import { FaGoogle, FaInstagram, FaXTwitter } from "react-icons/fa6";
import { FaComment, FaPalette } from "react-icons/fa";

// Form validation schema with more robust rules
const signInSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, and ._-"
    ),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password cannot exceed 100 characters"),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

// Form component moved outside

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const handleOAuthRedirect = (
    provider: "google" | "instagram" | "twitter"
  ) => {
    try {
      const oauthUrl =
        provider === "google"
          ? getGoogleOAuthUrl()
          : provider === "instagram"
          ? getInstagramOAuthUrl()
          : getTwitterOAuthUrl();
      window.location.href = oauthUrl;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not initiate OAuth flow"
      );
    }
  };

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      await signIn({
        username: data.username,
        password: data.password,
      });

      await setUser();

      // Clear sensitive form data
      form.reset();

      const redirect = searchParams.get("redirect") || "/";
      router.push(redirect);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An error occurred during sign in"
      );
      // Log error to your error tracking service
      console.error("Sign in error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(99,102,241,0.15)_0%,rgba(0,0,0,0)_50%,rgba(99,102,241,0.15)_100%)] animate-gradient-pulse" />

      <div className="container relative flex items-center justify-center min-h-screen p-4 sm:p-8 mx-auto">
        <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16 xl:gap-24 ">
          <div className="hidden lg:flex flex-1 flex-col items-start space-y-6 animate-in fade-in slide-in-from-left-8 delay-150 transform -translate-x-4 ">
            <div className="relative w-full aspect-[1.1] max-w-[480px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-indigo-500/20 rounded-[2.5rem] -rotate-3 shadow-xl animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/80 to-background rounded-[2.5rem] backdrop-blur-sm" />
              <div className="relative flex flex-col space-y-6 p-8 pr-16">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-2xl blur-xl" />
                    <div className="relative h-14 w-14 bg-gradient-to-br from-primary to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-2xl">💬</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-4xl font-bold leading-tight bg-gradient-to-br from-primary via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                      ChatSphere
                    </h2>
                    <p className="text-muted-foreground">
                      Connect. Chat. Create.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <ul className="space-y-4 text-muted-foreground">
                        <li className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-base">🔒</span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              Secure Messaging
                            </p>
                            <p className="text-sm">
                              End-to-end encrypted chats
                            </p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-base">🌐</span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              Cross Platform
                            </p>
                            <p className="text-sm">Sync across all devices</p>
                          </div>
                        </li>
                        <li className="flex items-center gap-3">
                          <div className="h-8 w-8 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-base">⚡</span>
                          </div>
                          <div className="space-y-0.5">
                            <p className="font-medium text-foreground">
                              Lightning Fast
                            </p>
                            <p className="text-sm">Real-time messaging</p>
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-75" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-base">🎯</span>
                        </span>
                        <p>
                          <span className="font-medium text-foreground">
                            10M+
                          </span>{" "}
                          messages sent daily through our platform
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute -top-6 -left-6 h-32 w-32 bg-gradient-to-br from-indigo-500/30 to-primary/30 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
            </div>
          </div>

          {/* Auth Card - Restructured */}
          <div className="w-full max-w-lg xl:max-w-xl rounded-2xl border bg-background/90 backdrop-blur-2xl shadow-xl p-6 sm:p-8 animate-in fade-in slide-in-from-right-8">
            <div className="flex flex-col space-y-1.5 pb-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome Back
                <span className="ml-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent animate-wiggle origin-[75%_80%]">
                  👋
                </span>
              </h1>
            </div>

            {/* Error Message - Improved */}
            {error && (
              <Alert variant="destructive" className="mb-6 transition-all">
                <AlertDescription className="flex items-center gap-2 text-sm">
                  <FaTimes className="flex-shrink-0" />
                  <span className="line-clamp-2">{error}</span>
                </AlertDescription>
              </Alert>
            )}

            {/* Form - Restructured Layout */}
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4">
                {/* Simplified Input Fields */}
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-sm font-medium">
                    Username
                  </Label>
                  <Input
                    id="username"
                    className="h-8 focus-visible:ring-primary/50"
                    {...form.register("username")}
                    placeholder="Enter your username"
                  />
                  {form.formState.errors.username && (
                    <p className="text-destructive text-sm flex items-center gap-1.5">
                      <FaTimes className="shrink-0" />
                      {form.formState.errors.username.message}
                    </p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="h-8 pr-12 focus-visible:ring-primary/50"
                      {...form.register("password")}
                      placeholder="Enter your password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-destructive text-sm flex items-center gap-1.5">
                      <FaTimes className="shrink-0" />
                      {form.formState.errors.password.message}
                    </p>
                  )}
                  <p className="text-right text-sm text-muted-foreground pt-1">
                    <Link
                      href="/forgot-password"
                      className="font-semibold text-primary hover:underline underline-offset-4"
                    >
                      Forgot password?
                    </Link>
                  </p>
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <Button
                type="submit"
                className="w-full h-12 rounded-lg font-semibold transition-all hover:shadow-lg"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <IoReload className="animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-gray-100">
                    Continue →
                  </span>
                )}
              </Button>
            </form>

            {/* OAuth Section - Improved Layout */}
            <div className="mt-2 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(["google", "instagram", "twitter"] as const).map(
                  (provider) => (
                    <Button
                      key={provider}
                      variant="outline"
                      className="h-10 gap-2 hover:border-primary/30 transition-colors"
                      onClick={() => handleOAuthRedirect(provider)}
                    >
                      {provider === "google" && (
                        <FaGoogle className="w-4 h-4" />
                      )}
                      {provider === "instagram" && (
                        <FaInstagram className="w-4 h-4" />
                      )}
                      {provider === "twitter" && (
                        <FaXTwitter className="w-4 h-4" />
                      )}
                      <span className="sr-only">{provider}</span>
                    </Button>
                  )
                )}
              </div>
            </div>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Try our exclusive features
                </span>
              </div>
            </div>
            {/* Quick Access - Improved Layout */}
            <div className="pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link href="/anonymous" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-10 gap-2 hover:bg-accent/50"
                  >
                    <FaComment className="text-primary" />
                    <span>Anonymous</span>
                  </Button>
                </Link>
                <Link href="/ai-chat" className="w-full">
                  <Button
                    variant="outline"
                    className="w-full h-10 gap-2 hover:bg-accent/50"
                  >
                    <FaPalette className="text-indigo-400" />
                    <span>AI Chat</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Signup Link - Improved */}
            <p className="mt-2 text-center text-sm text-muted-foreground">
              New to our platform?{" "}
              <Link
                href="/signup"
                className="font-semibold text-primary hover:underline underline-offset-4"
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
