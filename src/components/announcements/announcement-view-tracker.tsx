'use client';

import { useEffect } from 'react';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';

interface AnnouncementViewTrackerProps {
  announcementId: string;
  announcementTitle?: string;
  priority?: string;
}

export default function AnnouncementViewTracker({
  announcementId,
  announcementTitle,
  priority,
}: AnnouncementViewTrackerProps) {
  const { track } = usePostHogAnalytics();

  useEffect(() => {
    if (!announcementId) return;

    track(POSTHOG_EVENTS.announcementViewed, {
      announcement_id: announcementId,
      announcement_title: announcementTitle,
      announcement_priority: priority,
    });
  }, [announcementId, announcementTitle, priority, track]);

  return null;
}
