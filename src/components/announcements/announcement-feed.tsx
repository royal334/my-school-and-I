'use client';

import { useAnnouncements } from '@/hooks/use-announcements';
import AnnouncementCard from './announcement-card';
import AnnouncementFeedSkeleton from './announcement-feed-skeleton';
import AnnouncementFilters from './announcement-filters';
import EmptyState from './empty-state';
import ErrorState from './error-state';
import UnreadBanner from './unread-banner';

export default function AnnouncementFeed() {
  const {
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
  } = useAnnouncements();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <UnreadBanner
        unreadCount={unreadCount}
        filterMode={filters.filterMode}
        onToggleFilter={toggleFilterMode}
      />

      <AnnouncementFilters
        type={filters.type}
        priority={filters.priority}
        searchQuery={filters.searchQuery}
        onTypeChange={setType}
        onPriorityChange={setPriority}
        onSearchChange={setSearchQuery}
      />

      {loading && <AnnouncementFeedSkeleton />}

      {error && !loading && <ErrorState message={error} />}

      {!loading && filteredAnnouncements.length === 0 && <EmptyState />}

      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <AnnouncementCard
            key={announcement.id}
            announcement={announcement}
            isSaved={savedAnnouncements.has(announcement.id)}
            onSave={toggleSave}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}
