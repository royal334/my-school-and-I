import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  BoostTarget,
  ListingDraft,
  ListingImage,
  MarketplaceFeed,
  MarketplaceFilters,
  MarketplaceListing,
  MarketplaceListingDetail,
  MarketplaceListingResult,
  MarketplaceReview,
  OwnedListing,
  OwnedListingStatus,
  OwnedListingsResult,
  SavedMarketplaceListing,
  SellerProfile,
  SellerSlots,
  UserReview,
  VendorSummary,
} from '@/components/marketplace/types';
import { shuffle } from '@/utils/lib';

export const MARKETPLACE_PAGE_SIZE = 20;

const OWNED_LISTINGS_LIMIT = 200;
const DEFAULT_SELLER_SLOTS: SellerSlots = {
  active_listings: 0,
  max_listings: 3,
  available_slots: 3,
};

const CARD_COLUMNS = `
  id, title, price, negotiable, condition, category,
  seller_type, seller_id, vendor_id, is_urgent, is_boosted,
  location, views, saves_count, created_at,
  images:marketplace_listing_images (
    id, file_path, is_cover, display_order
  )
`;

const DETAIL_COLUMNS = `
  *,
  images:marketplace_listing_images (
    id, file_path, file_name, is_cover, display_order
  )
`;

const REVIEW_COLUMNS = `
  id, rating, comment, created_at,
  reviewer:profiles!marketplace_reviews_reviewer_id_fkey (
    id, full_name
  )
`;

const OWNED_COLUMNS = `
  id, title, price, condition, category, status,
  is_boosted, is_urgent, views, saves_count,
  created_at, sold_at, expires_at,
  images:marketplace_listing_images (
    id, file_path, is_cover, display_order
  )
`;

const SAVED_COLUMNS = `
  listing:marketplace_listings (
    id, title, price, negotiable, condition, category, status,
    seller_type, seller_id, is_urgent, location, created_at,
    images:marketplace_listing_images (
      id, file_path, is_cover, display_order
    )
  )
`;

const COUNTED_STATUSES: OwnedListingStatus[] = ['active', 'sold', 'archived', 'expired', 'draft'];

interface RawListingRow {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: string;
  category: string;
  seller_type: 'student' | 'vendor';
  seller_id: string;
  vendor_id: string | null;
  is_urgent: boolean;
  is_boosted: boolean;
  location: string | null;
  views: number;
  saves_count: number;
  created_at: string;
  images: ListingImage[] | null;
}

interface RawDetailRow extends RawListingRow {
  description: string | null;
  status: string;
  sold_at: string | null;
}

interface RawOwnedRow {
  id: string;
  title: string;
  price: number;
  condition: string;
  category: string;
  status: string;
  is_boosted: boolean;
  is_urgent: boolean;
  views: number;
  saves_count: number;
  created_at: string;
  sold_at: string | null;
  expires_at: string;
  images: ListingImage[] | null;
}

interface RawSavedRow {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: string;
  category: string;
  status: string;
  seller_type: 'student' | 'vendor';
  seller_id: string;
  is_urgent: boolean;
  location: string | null;
  created_at: string;
  images: ListingImage[] | null;
}

/** Removes duplicate image rows (by file_path); the first occurrence wins. */
function dedupeImages(images: ListingImage[] | null | undefined): ListingImage[] {
  const seen = new Set<string>();
  const unique: ListingImage[] = [];
  for (const image of images ?? []) {
    if (image.file_path && !seen.has(image.file_path)) {
      seen.add(image.file_path);
      unique.push(image);
    }
  }
  return unique;
}

function toListing(
  row: RawListingRow,
  sellerNames: Map<string, string>,
  sellerProfiles: Map<string, SellerProfile>,
  savedIds: Set<string>,
): MarketplaceListing {
  const images = dedupeImages(row.images);
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    negotiable: row.negotiable,
    condition: row.condition,
    category: row.category,
    seller_type: row.seller_type,
    seller_id: row.seller_id,
    vendor_id: row.vendor_id,
    is_urgent: row.is_urgent,
    is_boosted: row.is_boosted,
    is_saved: savedIds.has(row.id),
    location: row.location,
    views: row.views,
    saves_count: row.saves_count,
    created_at: row.created_at,
    cover_image: images.find((i) => i.is_cover) ?? images[0] ?? null,
    seller_name: sellerNames.get(row.seller_id) ?? 'Unknown',
    seller_profile: sellerProfiles.get(row.seller_id) ?? null,
  };
}

async function loadSellerContext(
  supabase: SupabaseClient,
  userId: string,
  rows: RawListingRow[],
) {
  const sellerIds = [...new Set(rows.map((row) => row.seller_id))];
  const listingIds = rows.map((row) => row.id);

  const [profilesRes, sellerProfilesRes, savesRes] = await Promise.all([
    sellerIds.length
      ? supabase.from('profiles').select('id, full_name').in('id', sellerIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    sellerIds.length
      ? supabase
          .from('marketplace_seller_profiles')
          .select('user_id, seller_type, average_rating, review_count, total_sales')
          .in('user_id', sellerIds)
      : Promise.resolve({ data: [] as SellerProfile[] }),
    listingIds.length
      ? supabase.from('marketplace_saves').select('listing_id').eq('user_id', userId).in('listing_id', listingIds)
      : Promise.resolve({ data: [] as { listing_id: string }[] }),
  ]);

  const sellerNames = new Map<string, string>();
  (profilesRes.data ?? []).forEach((profile) => {
    sellerNames.set(profile.id, profile.full_name || 'Unknown');
  });

  const sellerProfiles = new Map<string, SellerProfile>();
  (sellerProfilesRes.data ?? []).forEach((profile) => {
    if (profile.user_id) sellerProfiles.set(profile.user_id, profile);
  });

  const savedIds = new Set<string>((savesRes.data ?? []).map((save) => save.listing_id));

  return { sellerNames, sellerProfiles, savedIds };
}

/** Promoted + regular feed, mirroring GET /api/marketplace/listings. */
export async function getMarketplaceFeed(
  supabase: SupabaseClient,
  userId: string,
  filters: MarketplaceFilters,
  { limit = MARKETPLACE_PAGE_SIZE, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<MarketplaceFeed> {
  const promotedQuery = supabase
    .from('marketplace_listings')
    .select(CARD_COLUMNS)
    .eq('status', 'active')
    .eq('is_boosted', true)
    .order('created_at', { ascending: false })
    .limit(6);

  let feedQuery = supabase
    .from('marketplace_listings')
    .select(CARD_COLUMNS, { count: 'exact' })
    .eq('status', 'active')
    .eq('is_boosted', false)
    .range(offset, offset + limit - 1);

  if (filters.category && filters.category !== 'all') {
    feedQuery = feedQuery.eq('category', filters.category);
  }
  if (filters.condition) {
    feedQuery = feedQuery.eq('condition', filters.condition);
  }
  if (filters.sellerType) {
    feedQuery = feedQuery.eq('seller_type', filters.sellerType);
  }
  if (filters.minPrice) {
    feedQuery = feedQuery.gte('price', Number(filters.minPrice));
  }
  if (filters.maxPrice) {
    feedQuery = feedQuery.lte('price', Number(filters.maxPrice));
  }
  if (filters.urgent) {
    feedQuery = feedQuery.eq('is_urgent', true);
  }
  if (filters.negotiable) {
    feedQuery = feedQuery.eq('negotiable', true);
  }

  if (filters.sort === 'price_asc') {
    feedQuery = feedQuery.order('price', { ascending: true });
  } else if (filters.sort === 'price_desc') {
    feedQuery = feedQuery.order('price', { ascending: false });
  } else {
    feedQuery = feedQuery.order('created_at', { ascending: false });
  }

  const [promotedRes, feedRes] = await Promise.all([promotedQuery, feedQuery]);
  if (feedRes.error) throw feedRes.error;

  // PostgREST returns the embedded seller profile as a single object; the
  // generated Supabase types cannot infer that, so the rows are narrowed here.
  const promotedRows = (promotedRes.data ?? []) as unknown as RawListingRow[];
  let feedRows = (feedRes.data ?? []) as unknown as RawListingRow[];

  if (filters.search) {
    const term = filters.search.toLowerCase();
    feedRows = feedRows.filter(
      (row) =>
        row.title.toLowerCase().includes(term) ||
        row.category.toLowerCase().includes(term),
    );
  }

  const { sellerNames, sellerProfiles, savedIds } = await loadSellerContext(supabase, userId, [
    ...promotedRows,
    ...feedRows,
  ]);

  return {
    promoted: shuffle(
      promotedRows.map((row) => toListing(row, sellerNames, sellerProfiles, savedIds)),
    ),
    listings: feedRows.map((row) => toListing(row, sellerNames, sellerProfiles, savedIds)),
    total: feedRes.count ?? 0,
  };
}

/**
 * Full listing detail for the detail page, mirroring
 * GET /api/marketplace/listings/[id]. Returns null when the listing is missing
 * or hidden from the current user.
 */
export async function getMarketplaceListing(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
): Promise<MarketplaceListingResult | null> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(DETAIL_COLUMNS)
    .eq('id', listingId)
    .single();

  if (error || !data) return null;

  const row = data as unknown as RawDetailRow;
  if (row.status !== 'active' && row.seller_id !== userId) return null;

  const isOwn = row.seller_id === userId;

  const [sellerRes, sellerProfileRes, reviewsRes, saveRes, userReviewRes, boostRes, vendorRes] = await Promise.all([
    supabase.from('profiles').select('id, full_name').eq('id', row.seller_id).maybeSingle(),
    supabase
      .from('marketplace_seller_profiles')
      .select('user_id, seller_type, average_rating, review_count, total_sales')
      .eq('user_id', row.seller_id)
      .maybeSingle(),
    supabase
      .from('marketplace_reviews')
      .select(REVIEW_COLUMNS)
      .eq('listing_id', listingId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('marketplace_saves')
      .select('id')
      .eq('listing_id', listingId)
      .eq('user_id', userId)
      .maybeSingle(),
    supabase
      .from('marketplace_reviews')
      .select('id, rating, comment')
      .eq('listing_id', listingId)
      .eq('reviewer_id', userId)
      .maybeSingle(),
    supabase
      .from('marketplace_boosts')
      .select('boost_tier, expires_at')
      .eq('listing_id', listingId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle(),
    row.vendor_id
      ? supabase.from('vendors').select('id, business_name, rating').eq('id', row.vendor_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Views are recorded by ListingViewTracker via POST
  // /api/marketplace/listings/[id]/view, never from this render path.
  const images = dedupeImages(row.images).sort((a, b) => a.display_order - b.display_order);
  const sellerNames = new Map<string, string>();
  sellerNames.set(row.seller_id, sellerRes.data?.full_name || 'Unknown');

  const savedIds = new Set<string>();
  if (saveRes.data) savedIds.add(listingId);

  const sellerProfiles = new Map<string, SellerProfile>();
  if (sellerProfileRes.data?.user_id) {
    sellerProfiles.set(sellerProfileRes.data.user_id, sellerProfileRes.data);
  }

  const listing: MarketplaceListingDetail = {
    ...toListing(row, sellerNames, sellerProfiles, savedIds),
    description: row.description,
    is_own: isOwn,
    status: row.status,
    sold_at: row.sold_at,
    images,
    active_boost: (boostRes.data as { boost_tier: string; expires_at: string } | null) ?? null,
    vendor: (vendorRes.data as VendorSummary | null) ?? null,
  };

  return {
    listing,
    reviews: (reviewsRes.data ?? []) as unknown as MarketplaceReview[],
    userReview: (userReviewRes.data as UserReview | null) ?? null,
  };
}

/**
 * Listings owned by the current user plus a per-status tally, mirroring
 * GET /api/marketplace/my-listings. Tabs are filtered from the result so the
 * counts and the visible rows always agree.
 */
export async function getOwnedListings(
  supabase: SupabaseClient,
  userId: string,
): Promise<OwnedListingsResult> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select(OWNED_COLUMNS)
    .eq('seller_id', userId)
    .order('created_at', { ascending: false })
    .limit(OWNED_LISTINGS_LIMIT);

  if (error) throw error;

  const rows = (data ?? []) as unknown as RawOwnedRow[];
  const counts: OwnedListingsResult['counts'] = {
    active: 0,
    sold: 0,
    archived: 0,
    expired: 0,
    draft: 0,
    all: rows.length,
  };

  const listings = rows.map((row) => {
    const status = COUNTED_STATUSES.find((key) => key === row.status);
    if (status) counts[status] += 1;

    const images = dedupeImages(row.images);
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      condition: row.condition,
      category: row.category,
      status: row.status,
      is_boosted: row.is_boosted,
      is_urgent: row.is_urgent,
      views: row.views,
      saves_count: row.saves_count,
      created_at: row.created_at,
      sold_at: row.sold_at,
      expires_at: row.expires_at,
      cover_image: images.find((image) => image.is_cover) ?? images[0] ?? null,
    } satisfies OwnedListing;
  });

  return { listings, counts };
}

/** Slot allowance for the current seller, mirroring GET /api/marketplace/seller/slots. */
export async function getSellerSlots(
  supabase: SupabaseClient,
  userId: string,
): Promise<SellerSlots> {
  const { data } = await supabase
    .from('marketplace_slot_usage')
    .select('active_listings, max_listings, available_slots')
    .eq('user_id', userId)
    .maybeSingle();

  return data ?? DEFAULT_SELLER_SLOTS;
}

/** Listings the current user saved, newest save first, mirroring GET /api/marketplace/saved. */
export async function getSavedListings(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavedMarketplaceListing[]> {
  const { data, error } = await supabase
    .from('marketplace_saves')
    .select(SAVED_COLUMNS)
    .eq('user_id', userId)
    .order('saved_at', { ascending: false });

  if (error) throw error;

  const rows = ((data ?? []) as unknown as { listing: RawSavedRow | null }[])
    .map((row) => row.listing)
    .filter((listing): listing is RawSavedRow => Boolean(listing));

  if (rows.length === 0) return [];

  const sellerIds = [...new Set(rows.map((row) => row.seller_id))];
  const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', sellerIds);

  const sellerNames = new Map<string, string>();
  (profiles ?? []).forEach((profile) => {
    sellerNames.set(profile.id, profile.full_name || 'Unknown');
  });

  return rows.map((row) => {
    const images = dedupeImages(row.images);
    return {
      id: row.id,
      title: row.title,
      price: row.price,
      negotiable: row.negotiable,
      condition: row.condition,
      category: row.category,
      status: row.status,
      seller_type: row.seller_type,
      seller_name: sellerNames.get(row.seller_id) ?? 'Unknown',
      is_urgent: row.is_urgent,
      location: row.location,
      created_at: row.created_at,
      cover_image: images.find((image) => image.is_cover) ?? images[0] ?? null,
    };
  });
}

/** True when the current seller owns at least one listing (any status). */
export async function hasOwnedListings(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('marketplace_listings')
    .select('id')
    .eq('seller_id', userId)
    .limit(1);

  if (error) return false;
  return (data?.length ?? 0) > 0;
}

/** Prefills the sell form from an existing listing, mirroring the edit link on the detail page. */
export async function getOwnedListingDraft(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
): Promise<{ draft: ListingDraft; status: string } | null> {
  const { data } = await supabase
    .from('marketplace_listings')
    .select(
      'id, title, description, category, condition, price, negotiable, location, is_urgent, status, seller_id',
    )
    .eq('id', listingId)
    .maybeSingle();

  if (!data || data.seller_id !== userId) return null;

  return {
    draft: {
      title: data.title ?? '',
      description: data.description ?? '',
      category: data.category ?? '',
      condition: data.condition ?? '',
      price: data.price === null || data.price === undefined ? '' : String(data.price),
      negotiable: Boolean(data.negotiable),
      location: data.location ?? '',
      isUrgent: Boolean(data.is_urgent),
    },
    status: data.status,
  };
}

/** Own listing targeted by the boost flow. Returns null when it is not the seller's. */
export async function getOwnedListingForBoost(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
): Promise<BoostTarget | null> {
  const { data } = await supabase
    .from('marketplace_listings')
    .select('id, title, status, is_boosted, seller_id')
    .eq('id', listingId)
    .maybeSingle();

  if (!data || data.seller_id !== userId) return null;

  return {
    id: data.id,
    title: data.title,
    status: data.status,
    is_boosted: data.is_boosted,
  };
}
