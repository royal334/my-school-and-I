import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardProfileSectionProps } from "@/utils/types";

export function DashboardProfileSection({
  profile,
  hasActiveSubscription,
  currentGPA,
}: DashboardProfileSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2" data-tour="student-profile-card">
      <Card>
        <CardHeader>
          <h2 className="text-xl">Your profile</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Level</span>
            <span className="rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {profile?.level} Level
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Matric number</span>
            <span className="text-sm font-semibold text-foreground">
              {profile?.matric_number}
            </span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Status</span>
            <span
              className={
                hasActiveSubscription
                  ? "rounded-full bg-success-bg px-2.5 py-1 text-xs font-semibold text-success-text"
                  : "rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
              }
            >
              {hasActiveSubscription ? "Premium" : "Free"}
            </span>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="mt-1 w-full">
              Edit profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl">Getting started</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-success-bg text-xs font-bold text-success-text">
              ✓
            </div>
            <span className="text-sm text-muted-foreground">Complete your profile</span>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${
                currentGPA
                  ? "bg-success-bg text-success-text"
                  : "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300"
              }`}
            >
              {currentGPA ? "✓" : "1"}
            </div>
            <span className="text-sm text-muted-foreground">Add your first semester</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              2
            </div>
            <span className="text-sm text-muted-foreground">Browse study materials</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
              3
            </div>
            <span className="text-sm text-muted-foreground">Connect with vendors</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
