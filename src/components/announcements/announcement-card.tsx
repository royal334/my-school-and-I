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
    case 'urgent': return '#C44B2A';
    case 'important': return '#E8A020';
    default: return '#4A8C73';
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
        !is_read ? 'border-[#A8D8C2] bg-[#E8F5EF]/50 dark:border-white/15 dark:bg-white/5' : 'border-[#D6E5DF] bg-white dark:border-white/10 dark:bg-[#171918]'
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
              <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#E8F5EF] dark:bg-white/5 text-[#4A8C73] dark:text-[#7EC8A0] uppercase" style={{ letterSpacing: "0.06em" }}>
                {announcement.priority}
              </span>
              {announcement.category && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#F0F5F3] dark:bg-[#1E211F] text-[#6B7B75] dark:text-[#9BA19E] border border-[#D6E5DF] dark:border-white/10">
                  {announcement.category}
                </span>
              )}
              {!is_read && (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-[#1A3C34] text-[#E8F5EF]">
                  Unread
                </span>
              )}
            </div>

            <Link
              href={`/dashboard/announcements/${announcement.id}`}
              className="block group"
            >
              <h3 className="text-base font-medium text-[#141F1B] dark:text-[#E8F5EF] group-hover:text-[#4A8C73] dark:group-hover:text-[#7EC8A0] transition line-clamp-2" style={{ fontFamily: "var(--font-display)" }}>
                {announcement.title}
              </h3>
            </Link>

            <p className="text-sm text-[#6B7B75] dark:text-[#9BA19E] mt-1 line-clamp-2">
              {announcement.content}
            </p>
          </div>

          <button
            onClick={() => onSave(announcement.id)}
            className="mt-1 p-2 rounded hover:bg-[#F0F5F3] dark:hover:bg-[#202320] transition"
            title={isSaved ? 'Unsave' : 'Save'}
          >
            <Bookmark
              className={`h-5 w-5 ${
                isSaved ? 'fill-[#E8A020] text-[#E8A020]' : 'text-[#9AADA8]'
              }`}
            />
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-[#6B7B75] dark:text-[#9BA19E] mt-3">
          <div className="flex items-center justify-between w-full">
            <span className="flex flex-col gap-1">
              <span className="font-medium text-[#3D4A46] dark:text-[#C8D8D0]">{author.full_name}</span>
              {roleLabel && (
                <span className="capitalize text-[#6B7B75]">
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
