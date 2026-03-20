"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Check, X, Calendar, AlertTriangle } from "lucide-react";
import UpgradeButton from "@/components/payment/update-button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SubscriptionCardProps {
  profile: any;
}

export default function SubscriptionCard({ profile }: SubscriptionCardProps) {
  const router = useRouter();
  const isActive =
    profile?.subscription_status === "active" &&
    profile?.subscription_expires_at &&
    new Date(profile.subscription_expires_at) > new Date();

  const daysRemaining = profile?.subscription_expires_at
    ? Math.ceil(
        (new Date(profile.subscription_expires_at).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 0;

  const isCancelled = profile?.subscription_cancelled_at !== null;

  const reactivateSubscription = async () => {
    const res = await fetch("/api/subscription/reactivate", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast.success("Subscription reactivated!");
      router.refresh();
    }
  };

  const cancelSubscription = async () => {
    const res = await fetch("/api/subscription/cancel", { method: "POST" });
    const data = await res.json();
    if (data.success) {
      toast.success(
        `Cancelled. Access until ${new Date(data.access_until).toLocaleDateString()}`,{position:"top-center"}
      );
      router.refresh();
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-amber-600" />
          <h2 className="text-xl font-semibold">Subscription</h2>
        </div>
        <p className="text-sm text-slate-600">
          Manage your premium subscription and access
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
          <div>
            <p className="text-sm font-medium text-slate-700">Current Plan</p>
            <p className="text-lg font-bold text-slate-900">
              {isActive ? "Premium" : "Free"}
            </p>
          </div>
          <Badge
            className={
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-700"
            }
          >
            {isActive ? (
              <>
                <Check className="mr-1 h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <X className="mr-1 h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>

        {/* Expiry Date */}
        {isActive && profile?.subscription_expires_at && (
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex items-center gap-2 text-sm text-blue-900">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">
                Expires on{" "}
                {new Date(profile.subscription_expires_at).toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
              </span>
            </div>
            <p className="mt-1 text-xs text-blue-700">
              {daysRemaining > 0
                ? `${daysRemaining} days remaining`
                : "Expires today"}
            </p>
          </div>
        )}

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-900">
            {isActive ? "Your Premium Features:" : "Upgrade to Premium for:"}
          </p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${isActive ? "text-green-600" : "text-slate-400"}`}
                />
              </div>
              Access to all premium materials
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${isActive ? "text-green-600" : "text-slate-400"}`}
                />
              </div>
              Unlimited downloads
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${isActive ? "text-green-600" : "text-slate-400"}`}
                />
              </div>
              Priority support
            </li>
            <li className="flex items-center gap-2 text-sm text-slate-600">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isActive ? "bg-green-100" : "bg-slate-100"
                }`}
              >
                <Check
                  className={`h-3 w-3 ${isActive ? "text-green-600" : "text-slate-400"}`}
                />
              </div>
              Early access to new features
            </li>
          </ul>
        </div>

        {/* Action Button */}
        {isActive ? (
          isCancelled ? (
            // Show "Reactivate" button
            <Button
              onClick={reactivateSubscription}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Reactivate Subscription
            </Button>
          ) : (
            // Show "Cancel" button with AlertDialog confirmation
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Cancel Subscription
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Are you sure you want to cancel?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will stop your subscription from auto-renewing.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    You will still have full access to all premium materials
                    until your current subscription expires on{" "}
                    <strong>
                      {new Date(
                        profile.subscription_expires_at,
                      ).toLocaleDateString()}
                    </strong>
                    .
                  </AlertDescription>
                </Alert>

                <AlertDialogFooter className="mt-6">
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={cancelSubscription}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Confirm Cancellation
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        ) : (
          <>
            <UpgradeButton className="w-full bg-amber-600 hover:bg-amber-700" />
          </>
        )}
      </CardContent>
    </Card>
  );
}
