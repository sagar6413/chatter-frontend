"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { FaChevronLeft, FaGithub, FaKey } from "react-icons/fa";

export const Icons = {
  key: FaKey,
  logo: FaGithub, // Now using current GitHub icon name
  chevronLeft: FaChevronLeft,
};

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = (data: ForgotPasswordFormValues) => {
    console.log(data);
    // Handle password reset request
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background/95 to-muted/50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[960px] grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Visual Section */}
        <div className="hidden md:flex flex-col justify-center items-center space-y-6 p-8 bg-gradient-to-br from-primary/10 to-background rounded-2xl border border-border/50">
          <Icons.key className="h-24 w-24 text-primary" />
          <div className="space-y-2 text-center">
            <h2 className="text-2xl font-bold">Secure Password Recovery</h2>
            <p className="text-muted-foreground">
              Your security is our priority. We use end-to-end encryption for
              all password reset requests.
            </p>
          </div>
        </div>

        {/* Form Section */}
        <Card className="shadow-lg rounded-2xl border-border/50">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Icons.logo className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-center">
              Reset Your Password
            </h1>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    {...register("email")}
                    className={cn(
                      "peer h-12 text-base px-4 pt-4",
                      errors.email &&
                        "border-destructive focus-visible:ring-destructive"
                    )}
                    placeholder=" "
                  />
                  <Label
                    htmlFor="email"
                    className="absolute left-4 top-3 text-muted-foreground pointer-events-none transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-4 peer-focus:top-3 peer-focus:text-sm peer-focus:text-primary"
                  >
                    Email Address
                  </Label>
                </div>
                {errors.email && (
                  <div className="absolute -bottom-5 left-0 text-sm text-destructive">
                    {errors.email.message}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary transition-all"
              >
                Send Reset Instructions
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Link
              href="/signin"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center group"
            >
              <Icons.chevronLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Return to Sign In
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
