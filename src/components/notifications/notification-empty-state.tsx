'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationEmptyState() {
  return (
    <Card className="border-border" style={{ fontFamily: "var(--font-display)" }}>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No notifications yet</p>
        <p className="text-sm text-muted-foreground">
          You&apos;ll see alerts for announcements, vendor updates, and more here
        </p>
      </CardContent>
    </Card>
  );
}
