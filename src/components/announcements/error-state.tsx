'use client';

import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ErrorStateProps {
  message: string;
}

export default function ErrorState({ message }: ErrorStateProps) {
  return (
    <Card className="border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/30">
      <CardContent className="flex items-center gap-3 pt-6">
        <AlertCircle className="h-5 w-5 text-red-600" />
        <div>
          <p className="font-medium text-red-900 dark:text-red-200">Error loading announcements</p>
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        </div>
      </CardContent>
    </Card>
  );
}
