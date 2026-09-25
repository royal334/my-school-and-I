'use client';

import { MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function EmptyState() {
  return (
    <Card className="border-border bg-muted">
      <CardContent className="flex flex-col items-center justify-center py-12">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground font-medium">No announcements yet</p>
        <p className="text-sm text-muted-foreground">
          Check back soon for updates from your department
        </p>
      </CardContent>
    </Card>
  );
}
