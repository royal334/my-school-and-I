import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import Link from "next/link";

import { DashboardRecentAnnouncementsProps } from "@/utils/types";

export function DashboardRecentAnnouncements({
  announcements,
}: DashboardRecentAnnouncementsProps) {
  if (!announcements || announcements.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl" style={{ fontFamily: "var(--font-display)" }}>Recent announcements</h2>
          <Link href="/dashboard/announcements">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {announcements.map((announcement) => (
          <div
            key={announcement.id}
            className="flex items-start gap-3 rounded-lg border border-[#D6E5DF] dark:border-white/10 p-3"
          >
            <Bell className="h-5 w-5 text-[#4A8C73]" />
            <div className="flex-1">
              <h3 className="text-sm text-[#141F1B] dark:text-[#E8F5EF]">
                {announcement.title}
              </h3>
              <p className="text-xs text-[#6B7B75] dark:text-[#9BA19E]">
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#E8F5EF] dark:bg-[#1E211F] text-[#4A8C73] dark:text-[#7EC8A0]">
              {announcement.type}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
