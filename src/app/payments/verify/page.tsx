"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function VerifyPaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!reference) {
        setStatus("failed");
        setMessage("Invalid payment reference");
        return;
      }

      try {
        const response = await fetch(
          `/api/payments/verify?reference=${reference}`,
        );
        const data = await response.json();

        if (response.ok && data.success) {
          setStatus("success");
          setMessage("Your subscription has been activated!");

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard");
          }, 3000);
        } else {
          setStatus("failed");
          setMessage(data.error || "Payment verification failed");
        }
      } catch (error) {
        setStatus("failed");
        setMessage("An error occurred while verifying payment");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="text-center">
            {status === "loading" && (
              <>
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary-600" />
                <h2 className="mt-4 text-xl font-semibold">
                  Verifying Payment...
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Please wait while we confirm your payment
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto w-fit rounded-full bg-success-bg p-4">
                  <CheckCircle className="h-16 w-16 text-success" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-success-text">
                  Payment Successful!
                </h2>
                <p className="mt-2 text-muted-foreground">{message}</p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Redirecting to dashboard...
                </p>
              </>
            )}

            {status === "failed" && (
              <>
                <div className="mx-auto w-fit rounded-full bg-destructive/10 p-4">
                  <XCircle className="h-16 w-16 text-destructive" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-destructive">
                  Payment Failed
                </h2>
                <p className="mt-2 text-muted-foreground">{message}</p>
                <div className="mt-6 space-y-2">
                  <Link href="/dashboard/profile">
                    <Button className="w-full">Try Again</Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyPaymentPage() {
  return (
    <Suspense
      fallback={
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary-600" />
                <h2 className="mt-4 text-xl font-semibold">Loading...</h2>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <VerifyPaymentContent />
    </Suspense>
  );
}
