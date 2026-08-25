'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Notification } from './types';
import { getNotificationIcon, getNotificationColor, getDeeplink } from './notification-utils';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

function NotificationIcon({ typeKey, className }: { typeKey: string | null | undefined; className?: string }) {
  const Icon = getNotificationIcon(typeKey);
  return <Icon className={className} />;
}

export default function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const typeKey = notification.notification_type?.type_key;
  const colorClass = getNotificationColor(typeKey);
  const deeplink = getDeeplink(notification.data);

  const content = (
    <Card
      className={`transition-all hover:shadow-md cursor-pointer ${
        !notification.is_read
          ? 'border-blue-200 bg-blue-50 dark:border-blue-900/50 dark:bg-blue-950/30'
          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${colorClass}`}>
            <NotificationIcon typeKey={typeKey} className="h-4 w-4" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`text-sm font-semibold leading-tight ${
                !notification.is_read
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-700 dark:text-slate-300'
              }`}>
                {notification.title}
              </h3>

              {!notification.is_read && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
              )}
            </div>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
              {notification.body}
            </p>

            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-slate-400 dark:text-slate-500">
                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
              </span>

              <div className="flex items-center gap-2">
                {!notification.is_read && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <Check className="h-3 w-3" />
                    Mark read
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (deeplink) {
    return (
      <Link href={deeplink} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
