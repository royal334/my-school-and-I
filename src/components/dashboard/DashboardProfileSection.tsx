import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { Profile, DashboardProfileSectionProps } from "@/utils/types";

export function DashboardProfileSection({
  profile,
  hasActiveSubscription,
  currentGPA,
}: DashboardProfileSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Your Profile</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Level</span>
            <Badge className="bg-primary-100 text-primary-700 dark:bg-primary-950/50 dark:text-primary-400">
              {profile?.level} Level
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Matric Number</span>
            <span className="text-sm font-medium text-foreground">
              {profile?.matric_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge
              className={
                hasActiveSubscription
                  ? "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400"
                  : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
              }
            >
              {hasActiveSubscription ? "Premium" : "Free"}
            </Badge>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="mt-4 w-full">
              Edit Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Getting Started</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700 dark:bg-green-950/50 dark:text-green-400">
                ✓
              </div>
              <span className="text-sm text-muted-foreground">
                Complete your profile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-700 dark:bg-primary-950/50 dark:text-primary-400">
                {currentGPA ? "✓" : "1"}
              </div>
              <span className="text-sm text-muted-foreground">
                Add your first semester
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                2
              </div>
              <span className="text-sm text-muted-foreground">
                Browse study materials
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                3
              </div>
              <span className="text-sm text-muted-foreground">
                Connect with vendors
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
