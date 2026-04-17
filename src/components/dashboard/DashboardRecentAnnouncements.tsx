import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import Link from "next/link";

import { Announcement, DashboardRecentAnnouncementsProps } from "@/utils/types";

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
          <h2 className="text-xl font-semibold">Recent Announcements</h2>
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
            className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-slate-800 p-3"
          >
            <Bell className="h-5 w-5 text-primary-600" />
            <div className="flex-1">
              <h3 className="font-medium text-foreground">
                {announcement.title}
              </h3>
              <p className="text-xs text-muted-foreground">
                {new Date(announcement.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="secondary" className="text-xs">
              {announcement.type}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
