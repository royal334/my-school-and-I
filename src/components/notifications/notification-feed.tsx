'use client';

import { useNotifications } from '@/hooks/use-notifications';
import NotificationCard from './notification-card';
import NotificationFeedSkeleton from './notification-feed-skeleton';
import NotificationFilters from './notification-filters';
import NotificationEmptyState from './notification-empty-state';
import NotificationErrorState from './notification-error-state';
import NotificationHeader from './notification-header';

export default function NotificationFeed() {
  const {
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
  } = useNotifications();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <NotificationHeader
        unreadCount={unreadCount}
        filterMode={filters.filterMode}
        onToggleFilter={toggleFilterMode}
        onMarkAllAsRead={markAllAsRead}
      />

      <NotificationFilters
        type={filters.type}
        searchQuery={filters.searchQuery}
        onTypeChange={setType}
        onSearchChange={setSearchQuery}
      />

      {loading && <NotificationFeedSkeleton />}

      {error && !loading && <NotificationErrorState message={error} />}

      {!loading && filteredNotifications.length === 0 && <NotificationEmptyState />}

      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}
