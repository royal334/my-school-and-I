// components/announcements/announcement-feed.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Bell,
  MessageSquare,
  Bookmark,
  Clock,
  AlertCircle,
  Loader2,
  ChevronRight,
  Search,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'academic' | 'official_school';
  category: string;
  priority: 'normal' | 'important' | 'urgent';
  published_at: string;
  expires_at?: string;
  is_read: boolean;
  author: { full_name: string; role: { role: string } | null };
  total_reads?: number;
}

export default function AnnouncementFeed() {
  const supabase = createClient();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [savedAnnouncements, setSavedAnnouncements] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  const [selectedType, setSelectedType] = useState<'all' | 'academic' | 'official_school'>(
    'all'
  );
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'normal' | 'important' | 'urgent'>(
    'all'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled || !user) return;
      fetchAnnouncements();
      subscribeToNewAnnouncements();
      fetchSavedAnnouncements();
    }

    init();

    return () => { cancelled = true; };
  }, [selectedType, selectedPriority]);

  async function fetchAnnouncements() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        include_read: 'true',
        limit: '100',
      });

      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedPriority !== 'all') params.append('priority', selectedPriority);

      const response = await fetch(`/api/announcements?${params}`);

      if (!response.ok) throw new Error('Failed to fetch announcements');

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setUnreadCount(data.total_unread || 0);
    } catch (err: any) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToNewAnnouncements() {
    const channel = supabase
      .channel('announcements-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'announcements',
        },
        (payload) => {
          // New announcement - add to top
          setAnnouncements((prev) => [payload.new as Announcement, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // Show notification toast (optional)
          showNotification(payload.new as Announcement);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }

  function showNotification(announcement: Announcement) {
    // TODO: You can implement a toast notification here
    // For now, just log
    console.log('New announcement:', announcement.title);
  }

  async function fetchSavedAnnouncements() {
    try {
      const response = await fetch('/api/announcements/saved');
      if (response.ok) {
        const data = await response.json();
        setSavedAnnouncements(
          new Set(data.saved?.map((s: any) => s.announcement_id) || [])
        );
      }
    } catch (err) {
      console.error('Failed to fetch saved:', err);
    }
  }

  async function handleMarkAsRead(announcementId: string) {
    try {
      const response = await fetch(`/api/announcements/${announcementId}/read`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === announcementId ? { ...a, is_read: true } : a
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  }

  async function handleSaveAnnouncement(announcementId: string) {
    try {
      const isSaved = savedAnnouncements.has(announcementId);

      const response = await fetch(`/api/announcements/${announcementId}/save`, {
        method: isSaved ? 'DELETE' : 'POST',
      });

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
  }

  // Filter announcements
  let filteredAnnouncements = announcements;

  if (filterMode === 'unread') {
    filteredAnnouncements = filteredAnnouncements.filter((a) => !a.is_read);
  }

  if (searchQuery) {
    filteredAnnouncements = filteredAnnouncements.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort by priority and date
  filteredAnnouncements.sort((a, b) => {
    const priorityOrder = { urgent: 0, important: 1, normal: 2 };
    const priorityDiff =
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder];

    if (priorityDiff !== 0) return priorityDiff;

    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'important':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getCategoryIcon = (category: string) => {
    // Return emoji based on category
    const icons: Record<string, string> = {
      exam: '📝',
      lecture: '🎓',
      assignment: '📋',
      event: '🎉',
      deadline: '⏰',
      policy: '📜',
    };
    return icons[category] || '📢';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Unread badge header */}
      {unreadCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">
              You have {unreadCount} unread announcement
              {unreadCount !== 1 ? 's' : ''}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setFilterMode(filterMode === 'unread' ? 'all' : 'unread')}
          >
            {filterMode === 'unread' ? 'Show All' : 'Show Unread'}
          </Button>
        </div>
      )}

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select value={selectedType} onValueChange={(v: any) => setSelectedType(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="official_school">Official School</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPriority} onValueChange={(v: any) => setSelectedPriority(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 pt-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">Error loading announcements</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && filteredAnnouncements.length === 0 && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 font-medium">No announcements yet</p>
            <p className="text-sm text-slate-500">
              Check back soon for updates from your department
            </p>
          </CardContent>
        </Card>
      )}

      {/* Announcements list */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card
            key={announcement.id}
            className={`transition-all hover:shadow-md ${
              !announcement.is_read
                ? 'border-primary-300 bg-primary-50'
                : 'border-slate-200 bg-white'
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Badge row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority.toUpperCase()}
                    </Badge>
                    {announcement.category && (
                      <Badge variant="outline">
                        {getCategoryIcon(announcement.category)}{' '}
                        {announcement.category}
                      </Badge>
                    )}
                    {!announcement.is_read && (
                      <Badge className="bg-primary-600 text-white">
                        Unread
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <Link
                    href={`/dashboard/announcements/${announcement.id}`}
                    className="block group"
                  >
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary-600 transition line-clamp-2">
                      {announcement.title}
                    </h3>
                  </Link>

                  {/* Excerpt */}
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>

                {/* Save button */}
                <button
                  onClick={() => handleSaveAnnouncement(announcement.id)}
                  className="mt-1 p-2 rounded hover:bg-slate-100 transition"
                  title={
                    savedAnnouncements.has(announcement.id)
                      ? 'Unsave'
                      : 'Save'
                  }
                >
                  <Bookmark
                    className={`h-5 w-5 ${
                      savedAnnouncements.has(announcement.id)
                        ? 'fill-amber-500 text-amber-500'
                        : 'text-slate-400'
                    }`}
                  />
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
                {/* Meta info */}
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-700">
                      {announcement.author.full_name}
                    </span>
                    •
                    <span className="capitalize">
                      {announcement.author.role?.role?.replace(/_/g, ' ')}
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDistanceToNow(new Date(announcement.published_at), {
                      addSuffix: true,
                    })}
                  </span>

                  {announcement.expires_at && (
                    <span className="text-orange-600">
                      Expires{' '}
                      {formatDistanceToNow(new Date(announcement.expires_at))}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {!announcement.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(announcement.id)}
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
        ))}
      </div>
    </div>
  );
}