"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createClient } from "@/utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/api/auth/callback?type=recovery`,
      });

      if (error) throw error;

      setSubmittedEmail(data.email);
      setSent(true);
      toast.success("Password reset email sent! Check your inbox.");
    } catch (error: any) {
      console.error("Reset error:", error);
      toast.error(error.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted dark:bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-fit rounded-full bg-success-bg p-3 dark:bg-success-bg/20">
              <CheckCircle className="h-8 w-8 text-success dark:text-success" />
            </div>
            <h1 className="mt-4 text-2xl" style={{ fontFamily: "var(--font-display)" }}>
              Check Your Email
            </h1>
            <p className="mt-2 text-muted-foreground">
              We've sent password reset instructions to:
            </p>
            <p className="mt-1 font-medium text-foreground">{submittedEmail}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-success-bg p-4 text-sm text-success-text dark:bg-success-bg/20 dark:text-success-text">
              <p className="font-medium">Next steps:</p>
              <ol className="mt-2 list-inside list-decimal space-y-1 text-success-text dark:text-success-text">
                <li>Check your email inbox</li>
                <li>Click the reset link in the email</li>
                <li>Set your new password</li>
              </ol>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={() => setSent(false)}
                className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 underline"
              >
                try again
              </button>
            </p>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mx-auto w-fit rounded-full bg-success-bg p-3 dark:bg-success-bg/20">
            <Mail className="h-6 w-6 text-primary-600 dark:text-primary-300" />
          </div>
          <h1 className="mt-4 text-center text-2xl" style={{ fontFamily: "var(--font-display)" }}>
            Forgot password?
          </h1>
          <p className="mt-2 text-center text-muted-foreground">
            No worries! Enter your email and we'll send you instructions to
            reset your password.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className={errors.email ? "text-destructive" : ""}
              >
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@university.edu"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
                autoFocus
              />
              {errors.email ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter the email you used to sign up
                </p>
              )}
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Instructions
                </>
              )}
            </Button>

            <Link href="/login">
              <Button variant="ghost" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </Button>
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
