'use client';

import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FilterMode } from './types';

interface NotificationHeaderProps {
  unreadCount: number;
  filterMode: FilterMode;
  onToggleFilter: () => void;
  onMarkAllAsRead: () => void;
}

export default function NotificationHeader({
  unreadCount,
  filterMode,
  onToggleFilter,
  onMarkAllAsRead,
}: NotificationHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      {unreadCount > 0 && (
        <div className="bg-primary-50 dark:bg-muted border border-border rounded-lg p-3 flex items-center justify-between flex-1 gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onToggleFilter}
              className="text-xs"
            >
              {filterMode === 'unread' ? 'Show All' : 'Show Unread'}
            </Button>
          </div>
        </div>
      )}

      {unreadCount === 0 && filterMode === 'unread' && (
        <div className="bg-muted border border-border rounded-lg p-3 flex items-center justify-between flex-1">
          <span className="text-sm text-muted-foreground">
            No unread notifications
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={onToggleFilter}
            className="text-xs"
          >
            Show All
          </Button>
        </div>
      )}
    </div>
  );
}
