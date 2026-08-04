import { unstable_cache } from 'next/cache';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/utils/supabase/admin';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { getVendors } from '@/utils/supabase/queries/vendors';

const FEED_REVALIDATE = 60;
const SEARCH_REVALIDATE = 30;
const CATEGORIES_REVALIDATE = 3 * 24 * 60 * 60; // 3 days
const MAX_SEARCH_LENGTH = 80;
const SEARCH_INVALID_CHARS = /[%,_{}\[\]\(\),\\]/;

function normalizeSearchTerm(search?: string) {
  if (!search) return undefined;

  const trimmed = search.trim().toLowerCase();
  if (trimmed.length === 0) return undefined;
  if (SEARCH_INVALID_CHARS.test(trimmed)) {
    throw new Error('Search query contains unsupported characters.');
  }

  return trimmed.length > MAX_SEARCH_LENGTH ? trimmed.slice(0, MAX_SEARCH_LENGTH) : trimmed;
}

export interface VendorFeedFilters {
  category?: string;
  search?: string;
  services?: string[];
  minRating?: number;
  verifiedOnly?: boolean;
  featured_only?: boolean;
  limit?: number;
}

async function fetchVendors(filters: VendorFeedFilters) {
  const normalizedSearch = normalizeSearchTerm(filters.search);
  const normalizedFilters = { ...filters, search: normalizedSearch };

  const supabase = normalizedSearch
    ? createServerClient(await cookies())
    : createAdminClient();

  return getVendors({ ...normalizedFilters, supabaseProp: supabase, throwOnError: true });
}

/** Cached vendor feed (60s). */
export const getCachedVendors = unstable_cache(fetchVendors, ['vendors-feed'], {
  revalidate: FEED_REVALIDATE,
});

/** Cached vendor search results (30s). */
export const getCachedVendorSearch = (filters: VendorFeedFilters) => {
  const normalizedSearch = normalizeSearchTerm(filters.search);
  return unstable_cache(
    fetchVendors,
    ['vendors-search', filters.category ?? 'all', normalizedSearch ?? ''],
    { revalidate: SEARCH_REVALIDATE },
  )({ ...filters, search: normalizedSearch });
};

async function fetchVendorCategories() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('vendor_categories')
    .select('id, name, icon')
    .order('name');

  if (error) throw error;
  return data || [];
}

/** Cached vendor categories (3 days). */
export const getCachedVendorCategories = unstable_cache(
  fetchVendorCategories,
  ['vendor-categories'],
  { revalidate: CATEGORIES_REVALIDATE },
);
