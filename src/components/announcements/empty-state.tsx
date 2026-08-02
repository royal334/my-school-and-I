'use client';

import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EmptyState() {
  return (
    <Card className="border-slate-200 bg-slate-50">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 text-slate-400 mb-4" />
        <p className="text-slate-600 font-medium">No announcements yet</p>
        <p className="text-sm text-slate-500">
          Check back soon for updates from your department
        </p>
      </CardContent>
    </Card>
  );
}
