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
    <Card data-tour="student-recent-announcements">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-xl">Recent announcements</h2>
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
            className="flex items-start gap-3 rounded-xl border border-border bg-background/50 p-3 dark:bg-muted/30"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-950">
              <Bell className="h-4 w-4 text-primary-600 dark:text-primary-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-foreground">
                {announcement.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="rounded-full bg-primary-50 px-2 py-1 text-[10px] font-semibold capitalize text-primary-700 dark:bg-primary-950 dark:text-primary-300">
              {announcement.type}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
