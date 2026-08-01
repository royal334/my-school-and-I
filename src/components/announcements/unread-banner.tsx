'use client';

import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FilterMode } from './types';

interface UnreadBannerProps {
  unreadCount: number;
  filterMode: FilterMode;
  onToggleFilter: () => void;
}

export default function UnreadBanner({
  unreadCount,
  filterMode,
  onToggleFilter,
}: UnreadBannerProps) {
  if (unreadCount === 0) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Bell className="h-5 w-5 text-blue-600" />
        <span className="text-sm font-medium text-blue-900">
          You have {unreadCount} unread announcement
          {unreadCount !== 1 ? 's' : ''}
        </span>
      </div>
      <Button
        size="sm"
        variant="outline"
        onClick={onToggleFilter}
      >
        {filterMode === 'unread' ? 'Show All' : 'Show Unread'}
      </Button>
    </div>
  );
}
