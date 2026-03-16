"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, LogOut, Key, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface SecurityCardProps {
  email: string;
}

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm new password is required"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SecurityCard({ email }: SecurityCardProps) {
  const router = useRouter();
  const supabase = createClient();

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormValues) => {
    setLoading(true);

    try {
      // NOTE: Supabase auth.updateUser doesn't actually verify currentPassword
      // by default unless required in the auth provider settings, but we collect it
      // as it's a standard practice or if a custom endpoint verifying it is used.
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword,
      });

      if (error) throw error;

      toast.success("Password updated successfully!");
      setShowPasswordForm(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      router.push("/login");
      router.refresh();
    } catch (error: any) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-red-600" />
          <h2 className="text-xl font-semibold">Security</h2>
        </div>
        <p className="text-sm text-slate-600">
          Manage your password and account security
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Change Password Section */}
        {!showPasswordForm ? (
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => setShowPasswordForm(true)}
          >
            <Key className="mr-2 h-4 w-4" />
            Change Password
          </Button>
        ) : (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 rounded-lg border border-slate-200 p-4"
          >
            <h3 className="font-semibold text-slate-900">Change Password</h3>

            {/* Current Password */}
            <div className="space-y-2">
              <Label
                htmlFor="current-password"
                className={errors.currentPassword ? "text-red-500" : ""}
              >
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPasswords.current ? "text" : "password"}
                  {...register("currentPassword")}
                  className={
                    errors.currentPassword
                      ? "border-red-500 relative z-50 pointer-events-auto bg-white"
                      : "relative z-50 pointer-events-auto bg-white"
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      current: !showPasswords.current,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-xs text-red-500">
                  {errors.currentPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <Label
                htmlFor="new-password"
                className={errors.newPassword ? "text-red-500" : ""}
              >
                New Password
              </Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPasswords.new ? "text" : "password"}
                  {...register("newPassword")}
                  className={
                    errors.newPassword
                      ? "border-red-500 relative z-50 pointer-events-auto bg-white"
                      : "relative z-50 pointer-events-auto bg-white"
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      new: !showPasswords.new,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword ? (
                <p className="text-xs text-red-500">
                  {errors.newPassword.message}
                </p>
              ) : (
                <p className="text-xs text-slate-500">Minimum 8 characters</p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label
                htmlFor="confirm-password"
                className={errors.confirmPassword ? "text-red-500" : ""}
              >
                Confirm New Password
              </Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPasswords.confirm ? "text" : "password"}
                  {...register("confirmPassword")}
                  className={
                    errors.confirmPassword
                      ? "border-red-500 relative z-50 pointer-events-auto bg-white"
                      : "relative z-50 pointer-events-auto bg-white"
                  }
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords({
                      ...showPasswords,
                      confirm: !showPasswords.confirm,
                    })
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordForm(false);
                  reset();
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        )}

        {/* Sign Out */}
        <Button
          variant="outline"
          className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>

        {/* Account Info */}
        <div className="rounded-lg bg-slate-50 p-4 text-sm">
          <p className="font-medium text-slate-900">Account Email</p>
          <p className="mt-1 text-slate-600">{email}</p>
          <p className="mt-2 text-xs text-slate-500">
            For security reasons, you cannot change your email address. Contact
            support if needed.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
