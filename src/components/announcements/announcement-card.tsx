'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, ChevronRight, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Announcement } from './types';
import {
  formatRoleLabel,
} from './announcement-utils';

interface AnnouncementCardProps {
  announcement: Announcement;
  isSaved: boolean;
  onSave: (announcementId: string) => void;
  onMarkAsRead: (announcementId: string) => void;
}

function getPriorityStripe(priority: string) {
  switch (priority) {
    case 'urgent': return '#DC2626';
    case 'important': return '#F59E0B';
    default: return '#4F46E5';
  }
}

export default function AnnouncementCard({
  announcement,
  isSaved,
  onSave,
  onMarkAsRead,
}: AnnouncementCardProps) {
  const { author, sender_role, is_read } = announcement;
  const roleLabel = author.role?.role || sender_role;

  return (
    <div
      className={`flex border rounded-xl overflow-hidden transition-all hover:shadow-md ${
        !is_read ? 'border-primary-200 bg-primary-50/60 dark:border-border dark:bg-muted' : 'border-border bg-card'
      }`}
    >
      {/* Priority stripe */}
      <div
        className="w-1 flex-shrink-0"
        style={{ background: getPriorityStripe(announcement.priority) }}
      />

      <div className="flex-1 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary-50 dark:bg-muted text-primary-700 dark:text-primary-300 uppercase" style={{ letterSpacing: "0.06em" }}>
                {announcement.priority}
              </span>
              {announcement.category && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                  {announcement.category}
                </span>
              )}
              {!is_read && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-primary text-primary-foreground">
                  Unread
                </span>
              )}
            </div>

            <Link
              href={`/dashboard/announcements/${announcement.id}`}
              className="block group"
            >
              <h3 className="text-base font-medium text-foreground group-hover:text-primary-600 dark:group-hover:text-primary-400 transition line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
                {announcement.title}
              </h3>
            </Link>

            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {announcement.content}
            </p>
          </div>

          <button
            onClick={() => onSave(announcement.id)}
            className="mt-1 p-2 rounded hover:bg-muted dark:hover:bg-accent transition"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isSaved ? 'fill-accent-500 text-accent-500' : 'text-muted-foreground'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground mt-3">
          <div className="flex items-center justify-between w-full">
            <span className="flex flex-col gap-1">
              <span className="font-medium text-foreground">{author.full_name}</span>
              {roleLabel && (
                <span className="capitalize text-muted-foreground">
                  {formatRoleLabel(roleLabel)}
                </span>
              )}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(announcement.published_at), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="flex gap-2">
            {!is_read && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkAsRead(announcement.id)}
              >
                Mark read
              </Button>
            )}

            <Link href={`/dashboard/announcements/${announcement.id}`}>
              <Button size="sm" variant="ghost">
                View <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
