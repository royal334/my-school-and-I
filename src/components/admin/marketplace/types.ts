export type AdminMarketplaceTab = 'overview' | 'reports' | 'listings';

// ─── Reports ──────────────────────────────────────────────────────────────────

export interface AdminReport {
  id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  reporter: { full_name: string } | null;
  listing: {
    id: string;
    title: string;
    seller_type: string;
    seller_name: string;
  } | null;
}

export type AdminReportAction = 'remove_listing' | 'dismiss';

// ─── Listings ─────────────────────────────────────────────────────────────────

export interface AdminListingSummary {
  id: string;
  title: string;
  price: number;
  category: string;
  seller_type: string;
  seller_id: string;
  seller_name: string;
  status: string;
  is_boosted: boolean;
  is_urgent: boolean;
  views: number;
  saves_count: number;
  created_at: string;
}

export interface AdminListingImage {
  id: string;
  file_path: string;
  is_cover: boolean;
  display_order: number;
}

export interface AdminListingReport {
  id: string;
  reason: string;
  status: string;
  created_at: string;
  reporter: { full_name: string } | null;
}

export interface AdminListingDetail extends AdminListingSummary {
  description: string | null;
  negotiable: boolean;
  condition: string;
  location: string | null;
  images: AdminListingImage[];
  reports: AdminListingReport[];
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_active: number;
  total_sold: number;
  total_boosted: number;
  pending_reports: number;
  total_listings_today: number;
}
