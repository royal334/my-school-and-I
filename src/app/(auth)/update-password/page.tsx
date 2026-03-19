"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const currentPassword = watch("password");

  // Check if user is authenticated (from password reset link)
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        setIsAuthenticated(true);
      } else {
        toast.error("Invalid or expired reset link");
        router.push("/forgot-password");
      }
    };

    checkAuth();
  }, [router, supabase.auth]);

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");

      // Wait a moment then redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error: any) {
      console.error("Update error:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
          <p className="mt-4 text-slate-600">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto w-fit rounded-full bg-primary-100 p-3">
            <Lock className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold text-slate-900">
            Set New Password
          </h1>
          <p className="mt-2 text-center text-slate-600">
            Choose a strong password for your EngiPortal account
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    validate: {
                      hasUpperCase: (v) =>
                        /[A-Z]/.test(v) ||
                        "Include at least one uppercase letter",
                      hasLowerCase: (v) =>
                        /[a-z]/.test(v) ||
                        "Include at least one lowercase letter",
                      hasNumber: (v) =>
                        /[0-9]/.test(v) || "Include at least one number",
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message as string}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (val) => {
                      if (currentPassword !== val) {
                        return "Passwords do not match";
                      }
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
              <p className="font-medium text-slate-900">
                Password must contain:
              </p>
              <ul className="mt-2 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-3 w-3 ${
                      currentPassword?.length >= 8
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-3 w-3 ${
                      /[A-Z]/.test(currentPassword || "")
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-3 w-3 ${
                      /[a-z]/.test(currentPassword || "")
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  />
                  One lowercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle
                    className={`h-3 w-3 ${
                      /[0-9]/.test(currentPassword || "")
                        ? "text-green-600"
                        : "text-slate-400"
                    }`}
                  />
                  One number
                </li>
              </ul>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
