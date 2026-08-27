"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { markJustLoggedIn } from "@/components/tour/tour-login-marker";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      markJustLoggedIn();
      toast.success("Welcome back!", { position: "top-center" });
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Login failed", { position: "top-center" });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F5F3] p-4 dark:bg-[#0D0F0E] flex-col space-y-6">
      <div className="w-full max-w-md">
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="text-[#6B7B75] dark:text-[#9BA19E] hover:text-[#141F1B] dark:hover:text-[#E8F5EF] p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md dark:bg-[#171918] dark:border-white/10">
        <CardHeader>
          <CardTitle className="dark:text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>Welcome to CampusHub</CardTitle>
          <CardDescription className="dark:text-[#9BA19E]">
            Sign in to access materials and resources
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="dark:text-[#C8D8D0]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm text-[#C44B2A]">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="dark:text-[#C8D8D0]">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="pr-10"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AADA8] hover:text-[#6B7B75] dark:hover:text-[#C8D8D0]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-[#C44B2A]">
                  {errors.password.message}
                </p>
              )}
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#4A8C73] hover:underline dark:text-[#7EC8A0]"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 mt-4">
            <Button
              type="submit"
              className="w-full bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF] dark:bg-[#4A8C73] dark:hover:bg-[#3A7260]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-center text-sm text-[#6B7B75] dark:text-[#9BA19E]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-[#4A8C73] hover:underline dark:text-[#7EC8A0]"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
