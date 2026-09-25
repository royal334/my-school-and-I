'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="border-destructive/40 bg-destructive/10 dark:bg-destructive/15">
      <CardContent className="flex items-center gap-3 pt-6">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Error loading announcements</p>
          <p className="text-sm text-destructive">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
