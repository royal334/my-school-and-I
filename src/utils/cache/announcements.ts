import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Raw announcement row returned by the cached feed query.
 * The database types file is stale (missing status/priority/target_scope/etc),
 * so this mirrors the columns the feed route actually uses.
 */
export interface FeedAnnouncement {
  id: string;
  title: string;
  content: string;
  type: string;
  category: string | null;
  priority: string;
  status: string;
  target_scope: string;
  sender_id: string | null;
  author_id: string | null;
  sender_role: string | null;
  faculty_id: string | null;
  department_id: string | null;
  level: number | null;
  is_pinned: boolean;
  published_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface AnnouncementsFeedParams {
  userId: string;
  type?: string;
  category?: string;
  priority?: string;
  limit: number;
  offset: number;
  sort: string;
}

async function fetchAnnouncementsFeed(params: AnnouncementsFeedParams) {
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const [{ data: profileData }, { data: roleData }] = await Promise.all([
    supabase
      .from('profiles')
      .select('faculty_id, department_id, level')
      .eq('id', params.userId)
      .maybeSingle(),
    supabase
      .from('admin_roles')
      .select('role')
      .eq('user_id', params.userId)
      .maybeSingle(),
  ]);

  const visibilityContext = {
    role: roleData?.role?.toLowerCase() ?? null,
    facultyId: profileData?.faculty_id ?? null,
    departmentId: profileData?.department_id ?? null,
    level: profileData?.level ?? null,
  };

  let query = supabase
    .from('announcements')
    .select('*')
    .eq('status', 'published');

  if (params.type) {
    query = query.eq('type', params.type);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.priority) {
    query = query.eq('priority', params.priority);
  }

  if (params.sort === 'priority') {
    query = query
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) throw error;

  const visibleAnnouncements = (data || []).filter((announcement) => {
    const targetScope = announcement.target_scope as string | undefined;

    if (!targetScope || targetScope === 'general') {
      return true;
    }

    if (visibilityContext.role === 'super_admin' || visibilityContext.role === 'admin') {
      return true;
    }

    if (targetScope === 'faculty') {
      return visibilityContext.facultyId && announcement.faculty_id === visibilityContext.facultyId;
    }

    if (targetScope === 'department') {
      return visibilityContext.departmentId && announcement.department_id === visibilityContext.departmentId;
    }

    if (targetScope === 'level') {
      return visibilityContext.level != null && announcement.level === visibilityContext.level;
    }

    return false;
  }) as FeedAnnouncement[];

  const sortedAnnouncements = [...visibleAnnouncements].sort((left, right) => {
    if (params.sort === 'priority') {
      const leftPriority = left.priority || '';
      const rightPriority = right.priority || '';
      const priorityComparison = rightPriority.localeCompare(leftPriority);
      if (priorityComparison !== 0) {
        return priorityComparison;
      }
    }

    return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
  });

  const pagedAnnouncements = sortedAnnouncements.slice(
    params.offset,
    params.offset + params.limit,
  );

  return {
    announcements: pagedAnnouncements,
    count: sortedAnnouncements.length,
  };
}

/**
 * Cached announcement feed. Revalidates every 60s and tags entries so they
 * can be invalidated alongside other announcement data.
 */
export const getCachedAnnouncementsFeed = (params: AnnouncementsFeedParams) =>
  unstable_cache(
    async (input: AnnouncementsFeedParams) => fetchAnnouncementsFeed(input),
    [
      'announcements-feed',
      params.userId,
      params.type ?? 'all',
      params.category ?? 'all',
      params.priority ?? 'all',
      String(params.limit),
      String(params.offset),
      params.sort,
    ],
    {
      revalidate: 60,
      tags: [`announcements-feed:${params.userId}`],
    },
  )(params);
