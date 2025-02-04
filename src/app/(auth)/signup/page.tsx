"use client";

import React, { useState } from "react";
import { FaComment, FaEye, FaPalette, FaTimes } from "react-icons/fa";
import { IoReload } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  getGoogleOAuthUrl,
  getInstagramOAuthUrl,
  getTwitterOAuthUrl,
  signUp,
} from "@/mock/api";
import { FaEyeSlash, FaGoogle, FaInstagram, FaXTwitter } from "react-icons/fa6";
// import { signUp } from "@/services/authService";

// Enhanced validation schema with more robust rules
const signUpSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z\s-']+$/,
      "First name can only contain letters, spaces, hyphens, and apostrophes"
    ),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name cannot exceed 50 characters")
    .regex(
      /^[a-zA-Z\s-']+$/,
      "Last name can only contain letters, spaces, hyphens, and apostrophes"
    ),
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
    .max(100, "Password cannot exceed 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      terms: false,
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

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setIsLoading(true);
      setError(null);

      await signUp({
        displayName: `${data.firstName.trim()} ${data.lastName.trim()}`,
        username: data.username.trim(),
        password: data.password,
      });

      // Clear sensitive form data
      form.reset();

      // Redirect to sign in page with success message
      router.push("/signin?status=registration-success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
      // Log error to your error tracking service
      console.error("Registration error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePasswordStrength = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      noSequences: !/(abc|123|xyz|qwe|asd)/i.test(password),
      noRepeats: !/(.)\1{2,}/.test(password),
    };

    const passedChecks = Object.values(requirements).filter(Boolean).length;
    const totalChecks = Object.keys(requirements).length;
    const strengthPercentage = (passedChecks / totalChecks) * 100;

    return {
      color:
        strengthPercentage >= 85
          ? "#22c55e"
          : strengthPercentage >= 65
          ? "#fde047"
          : strengthPercentage >= 45
          ? "#eab308"
          : strengthPercentage >= 25
          ? "#ef4444"
          : "#991b1b",
      message:
        strengthPercentage >= 85
          ? "Strong: Meets all security requirements"
          : strengthPercentage >= 65
          ? "Good: Strong but could be improved"
          : strengthPercentage >= 45
          ? "Fair: Add more character types"
          : strengthPercentage >= 25
          ? "Weak: Needs more complexity"
          : "Very Weak: Minimum 8 characters",
    };
  };

  return (
    <main className="min-h-screen bg-background relative overflow-hidden ">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="container relative flex items-center justify-center min-h-screen p-4 mx-auto ">
        <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ">
          <div className="hidden lg:flex flex-1 flex-col items-start space-y-6 animate-in fade-in slide-in-from-left-8 delay-150">
            <div className="relative w-full aspect-square max-w-[480px]">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-purple-500/10 to-indigo-500/20 rounded-[2.5rem] -rotate-6 shadow-xl animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-background/80 to-background rounded-[2.5rem] backdrop-blur-sm" />
              <div className="relative flex flex-col space-y-8 p-8">
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

                <div className="grid gap-6">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-xl">🚀</span>
                          </div>
                          <div>
                            <h3 className="font-medium">Instant Connection</h3>
                            <p className="text-sm text-muted-foreground">
                              Start chatting immediately after signup
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-xl">🎨</span>
                          </div>
                          <div>
                            <h3 className="font-medium">
                              Personalized Experience
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Customize your chat environment
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-lg flex items-center justify-center shadow-inner">
                            <span className="text-xl">🛡️</span>
                          </div>
                          <div>
                            <h3 className="font-medium">Enhanced Security</h3>
                            <p className="text-sm text-muted-foreground">
                              Your privacy is our priority
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg blur opacity-75" />
                    <div className="relative bg-background/80 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-base">👥</span>
                          </span>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              1M+
                            </span>{" "}
                            active users
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-base">🌍</span>
                          </span>
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">
                              150+
                            </span>{" "}
                            countries
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-gradient-to-br from-primary/30 to-purple-500/30 rounded-full blur-3xl -z-10 animate-pulse" />
              <div className="absolute -top-6 -left-6 h-32 w-32 bg-gradient-to-br from-indigo-500/30 to-primary/30 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border bg-background/90 backdrop-blur-2xl shadow-xl py-2 px-5  animate-in fade-in slide-in-from-right-8 ">
            <div className="flex flex-col space-y-1.5 pb-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight">
                Create Account
                <span className="ml-2 bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                  🚀
                </span>
              </h1>
              <p className="text-muted-foreground text-sm mt-2">
                Already have an account?{" "}
                <Link
                  href="/signin"
                  className="font-semibold text-primary hover:underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert variant="destructive" className="mb-6 transition-all">
                    <AlertDescription className="flex items-center gap-2 text-sm">
                      <FaTimes className="shrink-0" />
                      <span className="line-clamp-2">{error}</span>
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {["firstName", "lastName"].map((field) => (
                  <div className="space-y-1" key={field}>
                    <Label htmlFor={field} className="text-sm font-medium">
                      {field === "firstName" ? "First Name" : "Last Name"}
                    </Label>
                    <Input
                      id={field}
                      className="h-8 focus-visible:ring-primary/50"
                      {...form.register(field as "firstName" | "lastName")}
                      placeholder={field === "firstName" ? "John" : "Doe"}
                    />
                    {form.formState.errors[
                      field as keyof typeof form.formState.errors
                    ] && (
                      <p className="text-destructive text-sm flex items-center gap-1.5">
                        <FaTimes className="shrink-0" />
                        {
                          form.formState.errors[
                            field as keyof typeof form.formState.errors
                          ]?.message
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  className="h-8 focus-visible:ring-primary/50"
                  {...form.register("username")}
                  placeholder="johndoe42"
                />
                {form.formState.errors.username && (
                  <p className="text-destructive text-sm flex items-center gap-1.5">
                    <FaTimes className="shrink-0" />
                    {form.formState.errors.username.message}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="h-8 pr-12 focus-visible:ring-primary/50"
                    {...form.register("password")}
                    placeholder="••••••••"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5" />
                    ) : (
                      <FaEye className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                {form.watch("password") && (
                  <div className="space-y-1 pt-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(
                            (form.watch("password")?.length || 0) * 3.33,
                            100
                          )}%`,
                          backgroundColor: calculatePasswordStrength(
                            form.watch("password")
                          ).color,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {
                        calculatePasswordStrength(form.watch("password"))
                          .message
                      }
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/10">
                <input
                  id="terms"
                  type="checkbox"
                  {...form.register("terms")}
                  className="w-5 h-5 accent-primary rounded-lg checked:bg-primary focus:ring-primary border-2 border-muted"
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline font-medium"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline font-medium"
                  >
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-lg font-semibold transition-all hover:shadow-lg"
                disabled={isLoading || form.formState.isSubmitting}
              >
                {isLoading ? (
                  <div className="flex items-center gap-1">
                    <IoReload className="animate-spin w-5 h-5" />
                    <span>Securing Account...</span>
                  </div>
                ) : (
                  <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-gray-100">
                    Create Account →
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-2 space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Quick signup with
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

            <div className="py-2">
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
          </div>
        </div>
      </div>
    </main>
  );
}
