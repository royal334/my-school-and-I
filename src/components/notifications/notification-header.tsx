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
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-lg p-3 flex items-center justify-between flex-1 gap-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
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
        <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between flex-1">
          <span className="text-sm text-slate-600 dark:text-slate-400">
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
