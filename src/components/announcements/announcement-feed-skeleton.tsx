'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AnnouncementFeedSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
                  <div className="h-6 w-24 animate-pulse rounded-full bg-slate-200" />
                </div>
                <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded bg-slate-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 flex-wrap gap-3">
                <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
                <div className="h-8 w-20 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
