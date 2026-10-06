import { CONDITIONS, MY_LISTINGS_TABS } from '@/components/marketplace/constants';
import type {
  MarketplaceFilters,
  MarketplaceSort,
  OwnedListingStatus,
} from '@/components/marketplace/types';

export const MARKETPLACE_BASE_PATH = '/dashboard/marketplace';
export const MARKETPLACE_API_PATH = '/api/marketplace';

export const DEFAULT_MARKETPLACE_FILTERS: MarketplaceFilters = {
  search: '',
  category: 'all',
  condition: '',
  sellerType: '',
  minPrice: '',
  maxPrice: '',
  urgent: false,
  negotiable: false,
  sort: 'recent',
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function toSort(value: string): MarketplaceSort {
  return value === 'price_asc' || value === 'price_desc' ? value : 'recent';
}

/** Normalises `?search=&category=&condition=&seller_type=&min_price=&max_price=&sort=`. */
export function parseMarketplaceFilters(params: RawSearchParams): MarketplaceFilters {
  const condition = first(params.condition);
  const category = first(params.category);

  return {
    search: first(params.search),
    category: category || 'all',
    condition: (CONDITIONS as readonly string[]).includes(condition) ? condition : '',
    sellerType: first(params.seller_type),
    minPrice: first(params.min_price),
    maxPrice: first(params.max_price),
    urgent: first(params.urgent) === 'true',
    negotiable: first(params.negotiable) === 'true',
    sort: toSort(first(params.sort)),
  };
}

/** Serialises filters back to a query string, omitting defaults. */
export function marketplaceQueryString(filters: MarketplaceFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.category && filters.category !== 'all') params.set('category', filters.category);
  if (filters.condition) params.set('condition', filters.condition);
  if (filters.sellerType) params.set('seller_type', filters.sellerType);
  if (filters.minPrice) params.set('min_price', filters.minPrice);
  if (filters.maxPrice) params.set('max_price', filters.maxPrice);
  if (filters.urgent) params.set('urgent', 'true');
  if (filters.negotiable) params.set('negotiable', 'true');
  if (filters.sort !== 'recent') params.set('sort', filters.sort);
  return params.toString();
}

export function hasActiveFilters(filters: MarketplaceFilters): boolean {
  return Boolean(
    filters.condition ||
      filters.sellerType ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.urgent ||
      filters.negotiable ||
      (filters.category && filters.category !== 'all'),
  );
}

/** Normalises the `?status=` tab used by the my-listings page. */
export function parseOwnedListingsStatus(
  params: Record<string, string | string[] | undefined>,
): OwnedListingStatus | 'all' {
  const value = Array.isArray(params.status) ? (params.status[0] ?? '') : (params.status ?? '');
  return MY_LISTINGS_TABS.some((tab) => tab.key === value) ? (value as OwnedListingStatus | 'all') : 'active';
}

/** Href for a my-listings tab, keeping the default `active` tab url-free. */
export function ownedListingsTabHref(tab: string): string {
  return tab === 'active' ? `${MARKETPLACE_BASE_PATH}/my-listings` : `${MARKETPLACE_BASE_PATH}/my-listings?status=${tab}`;
}
