'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type {
  Notification,
  NotificationFilters,
  NotificationType,
} from '@/components/notifications/types';
import { sortNotifications } from '@/components/notifications/notification-utils';

export function useNotifications() {
  const supabase = useMemo(() => createClient(), []);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    searchQuery: '',
    filterMode: 'all',
  });

  const pathname = usePathname();
  const isNotificationsPage = pathname === '/dashboard/notifications' || pathname === '/agent/notifications';

  const getParams = useCallback(() => {
    const params = new URLSearchParams({ limit: '100' });
    if (filters.type !== 'all') params.append('type', filters.type);
    if (filters.searchQuery) params.append('search', filters.searchQuery);
    if (filters.filterMode === 'unread') params.append('unread_only', 'true');
    return params;
  }, [filters.type, filters.searchQuery, filters.filterMode]);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/notifications?${getParams()}`);

      if (!response.ok) throw new Error('Failed to fetch notifications');

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.total_unread || 0);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch notifications';
      setError(message);
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
    }
  }, [getParams]);

  useEffect(() => {
    if (!isNotificationsPage) return;
    let cancelled = false;

    async function init() {
      const { data, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (authError || !data.user) {
        setError('Sign in to view notifications.');
        setLoading(false);
        return;
      }
      fetchNotifications();
    }

    init();
    return () => { cancelled = true; };
  }, [isNotificationsPage, fetchNotifications, supabase]);

  const setType = useCallback((type: NotificationType) => {
    setFilters((prev) => ({ ...prev, type }));
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
  }, []);

  const toggleFilterMode = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      filterMode: prev.filterMode === 'unread' ? 'all' : 'unread',
    }));
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = await fetch(
        `/api/notifications/${notificationId}/read`,
        { method: 'POST' }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => n.id === notificationId ? { ...n, is_read: true } : n)
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications/read-all', {
        method: 'POST',
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  const filteredNotifications = useMemo(() => {
    return sortNotifications(notifications);
  }, [notifications]);

  return {
    notifications,
    loading,
    error,
    unreadCount,
    filters,
    filteredNotifications,
    setType,
    setSearchQuery,
    toggleFilterMode,
    markAsRead,
    markAllAsRead,
  };
}
