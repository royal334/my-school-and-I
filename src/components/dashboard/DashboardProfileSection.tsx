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
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>Your profile</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">Level</span>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#E8F5EF] dark:bg-[#1A2C25] text-[#3A7260] dark:text-[#7EC8A0]">
              {profile?.level} Level
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">Matric number</span>
            <span className="text-sm font-medium text-[#141F1B] dark:text-[#E8F5EF]">
              {profile?.matric_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">Status</span>
            <span
              className={
                hasActiveSubscription
                  ? "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#E8F5EF] dark:bg-[#1A2C25] text-[#1A7A52] dark:text-[#7EC8A0]"
                  : "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-[#F0F5F3] dark:bg-[#1A2C25] text-[#6B7B75] dark:text-[#A8C8BB]"
              }
            >
              {hasActiveSubscription ? "Premium" : "Free"}
            </span>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="mt-4 w-full">
              Edit profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>Getting started</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EF] dark:bg-[#1A2C25] text-xs text-[#1A7A52] dark:text-[#7EC8A0]">
                ✓
              </div>
              <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">
                Complete your profile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8F5EF] dark:bg-[#1A2C25] text-xs text-[#1A7A52] dark:text-[#7EC8A0]">
                {currentGPA ? "✓" : "1"}
              </div>
              <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">
                Add your first semester
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F5F3] dark:bg-[#1A2C25] text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
                2
              </div>
              <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">
                Browse study materials
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#F0F5F3] dark:bg-[#1A2C25] text-xs text-[#6B7B75] dark:text-[#A8C8BB]">
                3
              </div>
              <span className="text-sm text-[#6B7B75] dark:text-[#A8C8BB]">
                Connect with vendors
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
