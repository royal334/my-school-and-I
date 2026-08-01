'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { Bookmark, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { Announcement } from './types';
import {
  formatRoleLabel,
  getCategoryIcon,
  getPriorityColor,
} from './announcement-utils';

interface AnnouncementCardProps {
  announcement: Announcement;
  isSaved: boolean;
  onSave: (announcementId: string) => void;
  onMarkAsRead: (announcementId: string) => void;
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
    <Card
      className={`transition-all hover:shadow-md ${
        !is_read ? 'border-primary-300 bg-primary-50' : 'border-slate-200 bg-white'
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge className={getPriorityColor(announcement.priority)}>
                {announcement.priority.toUpperCase()}
              </Badge>
              {announcement.category && (
                <Badge variant="outline">
                  {getCategoryIcon(announcement.category)} {announcement.category}
                </Badge>
              )}
              {!is_read && (
                <Badge className="bg-primary-600 text-white">Unread</Badge>
              )}
            </div>

            <Link
              href={`/dashboard/announcements/${announcement.id}`}
              className="block group"
            >
              <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition line-clamp-2">
                {announcement.title}
              </h3>
            </Link>

            <p className="text-sm text-slate-600 mt-1 line-clamp-2">
              {announcement.content}
            </p>
          </div>

          <button
            onClick={() => onSave(announcement.id)}
            className="mt-1 p-2 rounded hover:bg-slate-100 transition"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isSaved ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
              }`}
            />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center justify-between w-full">
            <span className="flex flex-col gap-2">
              <span className="font-lg text-slate-700">{author.full_name}</span>

              {roleLabel && (
                <span className="capitalize font-lg text-slate-700">
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
                Mark Read
              </Button>
            )}

            <Link href={`/dashboard/announcements/${announcement.id}`}>
              <Button size="sm" variant="ghost">
                View <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
