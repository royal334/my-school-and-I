import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
  /** User access token so RLS still scopes the query (cookies are not allowed inside the cache scope). */
  token: string;
  type?: string;
  category?: string;
  priority?: string;
  limit: number;
  offset: number;
  sort: string;
}

async function fetchAnnouncementsFeed(params: AnnouncementsFeedParams) {
  // Reuse the anon key + the user's access token so Supabase RLS filters
  // visibility exactly as it does for the original per-user query.
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${params.token}`,
      },
    },
  });

  let query = supabase
    .from('announcements')
    .select('*', { count: 'exact' })
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

  query = query.range(params.offset, params.offset + params.limit - 1);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    announcements: (data || []) as FeedAnnouncement[],
    count: count || 0,
  };
}

/**
 * Cached announcement feed. Revalidates every 60s. Keyed by the full filter
 * object (including the user's token), so each user/filter combination gets
 * its own correctly RLS-scoped entry.
 */
export const getCachedAnnouncementsFeed = unstable_cache(
  fetchAnnouncementsFeed,
  ['announcements-feed'],
  { revalidate: 60 },
);
