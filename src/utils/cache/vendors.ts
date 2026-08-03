import { unstable_cache } from 'next/cache';
import { createAdminClient } from '@/utils/supabase/admin';
import { getVendors } from '@/utils/supabase/queries/vendors';

const FEED_REVALIDATE = 60;
const SEARCH_REVALIDATE = 30;
const CATEGORIES_REVALIDATE = 3 * 24 * 60 * 60; // 3 days

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
  // Approved vendors + public category/owner data: safe to read with the
  // service-role client. Errors propagate so they are not cached.
  const supabase = createAdminClient();
  return getVendors({ ...filters, supabaseProp: supabase, throwOnError: true });
}

/** Cached vendor feed (60s). */
export const getCachedVendors = unstable_cache(fetchVendors, ['vendors-feed'], {
  revalidate: FEED_REVALIDATE,
});

/** Cached vendor search results (30s). */
export const getCachedVendorSearch = unstable_cache(
  fetchVendors,
  ['vendors-search'],
  { revalidate: SEARCH_REVALIDATE },
);

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
