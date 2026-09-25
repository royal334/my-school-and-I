'use client';

import { Card, CardContent } from '@/components/ui/card';

export default function NotificationFeedSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="border-border">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                  <div className="h-2 w-2 animate-pulse rounded-full bg-muted" />
                </div>
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
