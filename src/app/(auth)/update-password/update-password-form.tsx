"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import {
  PASSWORD_REQUIREMENTS,
  passwordStrengthSchema,
} from "@/lib/validations/password";

const updatePasswordSchema = z
  .object({
    password: passwordStrengthSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const newPassword = watch("password");

  const onSubmit = async (data: UpdatePasswordValues) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");

      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Update error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to update password",
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark:bg-background">
      <Card className="w-full max-w-md dark:bg-card dark:border-border">
        <CardHeader>
          <div className="mx-auto w-fit rounded-full bg-primary-100 p-3 dark:bg-primary-950/50">
            <Lock className="h-6 w-6 text-primary-600 dark:text-primary-400" />
          </div>
          <h1 className="mt-4 text-center text-2xl font-bold text-foreground">
            Set New Password
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            Choose a strong password for your Campus&Me account
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
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
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
                  {...register("confirmPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {errors.confirmPassword.message as string}
                </p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground dark:bg-muted/50">
              <p className="font-medium text-foreground">
                Password must contain:
              </p>
              <ul className="mt-2 space-y-1">
                {PASSWORD_REQUIREMENTS.map((requirement) => (
                  <li key={requirement.id} className="flex items-center gap-2">
                    <CheckCircle
                      className={`h-3 w-3 ${
                        requirement.test(newPassword || "")
                          ? "text-success dark:text-success"
                          : "text-muted-foreground dark:text-muted-foreground"
                      }`}
                    />
                    {requirement.label}
                  </li>
                ))}
              </ul>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
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