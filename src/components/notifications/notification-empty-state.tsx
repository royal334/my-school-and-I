'use client';

import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function NotificationEmptyState() {
  return (
    <Card className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Bell className="h-12 w-12 text-slate-400 dark:text-slate-500 mb-4" />
        <p className="text-slate-600 dark:text-slate-400 font-medium">No notifications yet</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          You&apos;ll see alerts for announcements, vendor updates, and more here
        </p>
      </CardContent>
    </Card>
  );
}
