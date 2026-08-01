'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';
import type {
  Announcement,
  AnnouncementFilters,
  AnnouncementPriority,
  AnnouncementType,
} from '@/components/announcements/types';
import { sortAnnouncements } from '@/components/announcements/announcement-utils';

export function useAnnouncements() {
  const supabase = useMemo(() => createClient(), []);
  const { track } = usePostHogAnalytics();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [savedAnnouncements, setSavedAnnouncements] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [filters, setFilters] = useState<AnnouncementFilters>({
    type: 'all',
    priority: 'all',
    searchQuery: '',
    filterMode: 'all',
  });

  const getAnnouncementParams = useCallback(() => {
    const params = new URLSearchParams({
      include_read: 'true',
      limit: '100',
    });

    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.priority !== 'all') params.append('priority', filters.priority);

    return params;
  }, [filters.type, filters.priority]);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/announcements?${getAnnouncementParams()}`
      );

      if (!response.ok) throw new Error('Failed to fetch announcements');

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setUnreadCount(data.total_unread || 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch announcements';
      setError(message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [getAnnouncementParams]);

  const fetchSavedAnnouncements = useCallback(async () => {
    try {
      const response = await fetch('/api/announcements/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedAnnouncements(
          new Set(data.saved?.map((s: { announcement_id: string }) => s.announcement_id) || [])
        );
      }
    } catch (err) {
      console.error('Failed to fetch saved:', err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      fetchAnnouncements();
      fetchSavedAnnouncements();
    }

    init();

    return () => { cancelled = true; };
  }, [fetchAnnouncements, fetchSavedAnnouncements, supabase]);

  const setType = useCallback((type: AnnouncementType) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const setPriority = useCallback((priority: AnnouncementPriority) => {
    setFilters((prev) => ({ ...prev, priority }));
  }, []);

  const setSearchQuery = useCallback(
    (query: string) => {
      setFilters((prev) => ({ ...prev, searchQuery: query }));

      if (query) {
        track(POSTHOG_EVENTS.announcementSearchPerformed, {
          search_query: query,
          selected_type: filters.type,
          selected_priority: filters.priority,
          filter_mode: filters.filterMode,
        });
      }
    },
    [track, filters.type, filters.priority, filters.filterMode]
  );

  const toggleFilterMode = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      filterMode: prev.filterMode === 'unread' ? 'all' : 'unread',
    }));
  }, []);

  const markAsRead = useCallback(async (announcementId: string) => {
    try {
      const response = await fetch(
        `/api/announcements/${announcementId}/read`,
        { method: 'POST' }
      );

      if (response.ok) {
        setAnnouncements((prev) =>
          prev.map((a) => a.id === announcementId ? { ...a, is_read: true } : a)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }, []);

  const toggleSave = useCallback(
    async (announcementId: string) => {
      try {
        const isSaved = savedAnnouncements.has(announcementId);

        const response = await fetch(
          `/api/announcements/${announcementId}/save`,
          { method: isSaved ? 'DELETE' : 'POST' }
        );

        if (response.ok) {
          const newSaved = new Set(savedAnnouncements);
          if (isSaved) {
            newSaved.delete(announcementId);
          } else {
            newSaved.add(announcementId);
          }
          setSavedAnnouncements(newSaved);
        }
      } catch (err) {
        console.error('Failed to save announcement:', err);
      }
    },
    [savedAnnouncements]
  );

  const filteredAnnouncements = useMemo(() => {
    let result = announcements;

    if (filters.filterMode === 'unread') {
      result = result.filter((a) => !a.is_read);
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.content.toLowerCase().includes(query)
      );
    }

    return sortAnnouncements(result);
  }, [announcements, filters.filterMode, filters.searchQuery]);

  return {
    announcements,
    savedAnnouncements,
    loading,
    error,
    unreadCount,
    filters,
    filteredAnnouncements,
    setType,
    setPriority,
    setSearchQuery,
    toggleFilterMode,
    markAsRead,
    toggleSave,
  };
}
