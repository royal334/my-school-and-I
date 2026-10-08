export interface ListingImage {
  id: string;
  file_path: string;
  file_name?: string | null;
  is_cover: boolean;
  display_order: number;
}

export interface SellerProfile {
  user_id?: string;
  seller_type?: 'student' | 'vendor';
  average_rating: number | null;
  review_count: number;
  total_sales?: number | null;
}

export interface VendorSummary {
  id: string;
  business_name: string;
}

/** Shape used by feed cards and grids. */
export interface MarketplaceListing {
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
  is_saved: boolean;
  location: string | null;
  views: number;
  saves_count: number;
  created_at: string;
  cover_image: ListingImage | null;
  seller_name: string;
  seller_profile: SellerProfile | null;
}

/** Full shape returned for a single listing detail page. */
export interface MarketplaceListingDetail extends MarketplaceListing {
  description: string | null;
  is_own: boolean;
  status: string;
  sold_at: string | null;
  images: ListingImage[];
  active_boost: { boost_tier: string; expires_at: string } | null;
  vendor: VendorSummary | null;
}

export interface MarketplaceReview {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: { id: string; full_name: string } | null;
}

export interface UserReview {
  id: string;
  rating: number;
  comment: string | null;
}

export interface MarketplaceFeed {
  promoted: MarketplaceListing[];
  listings: MarketplaceListing[];
  total: number;
}

export interface MarketplaceListingResult {
  listing: MarketplaceListingDetail;
  reviews: MarketplaceReview[];
  userReview: UserReview | null;
}

export type MarketplaceSort = 'recent' | 'price_asc' | 'price_desc';

/** Slot allowance for the current seller, mirrored from the seller slots API. */
export interface SellerSlots {
  active_listings: number;
  max_listings: number;
  available_slots: number;
}

/** Fields the sell wizard collects and writes to a listing. */
export interface ListingDraft {
  title: string;
  description: string;
  category: string;
  condition: string;
  price: string;
  negotiable: boolean;
  location: string;
  isUrgent: boolean;
}

export type OwnedListingStatus = 'active' | 'sold' | 'archived' | 'expired' | 'draft';

/** Listing owned by the current user, as shown on the my-listings page. */
export interface OwnedListing {
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
  cover_image: ListingImage | null;
}

export interface OwnedListingsResult {
  listings: OwnedListing[];
  counts: Record<OwnedListingStatus | 'all', number>;
}

/** Listing saved by the current user, as shown on the saved page. */
export interface SavedMarketplaceListing {
  id: string;
  title: string;
  price: number;
  negotiable: boolean;
  condition: string;
  category: string;
  status: string;
  seller_type: 'student' | 'vendor';
  seller_name: string;
  is_urgent: boolean;
  location: string | null;
  created_at: string;
  cover_image: ListingImage | null;
}

/** Listing being boosted — only ever the current user's own listing. */
export interface BoostTarget {
  id: string;
  title: string;
  status: string;
  is_boosted: boolean;
}

export interface BoostTier {
  key: string;
  label: string;
  emoji: string;
  price: number;
  duration: string;
  hours: number;
  features: string[];
  /** Tailwind text colour classes, e.g. for the tier accent. */
  accent: string;
  /** Tailwind surface classes, e.g. `border-* bg-*`. */
  surface: string;
  popular?: boolean;
}

export interface MarketplaceFilters {
  search: string;
  category: string;
  condition: string;
  sellerType: string;
  minPrice: string;
  maxPrice: string;
  urgent: boolean;
  negotiable: boolean;
  sort: MarketplaceSort;
}

export type MarketplaceFilterKey = keyof MarketplaceFilters;
