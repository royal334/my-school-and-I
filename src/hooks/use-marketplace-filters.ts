'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { hasActiveFilters, parseMarketplaceFilters } from '@/components/marketplace/filters';
import type { MarketplaceFilters } from '@/components/marketplace/types';

/**
 * Keeps the marketplace browse state in the URL so the feed can be rendered on
 * the server (and shared/bookmarkable) while the controls stay interactive.
 */
export function useMarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = useMemo(
    () => parseMarketplaceFilters(searchParams as unknown as Record<string, string | string[] | undefined>),
    [searchParams],
  );

  const push = useCallback(
    (next: MarketplaceFilters) => {
      const params = new URLSearchParams();
      if (next.search) params.set('search', next.search);
      if (next.category && next.category !== 'all') params.set('category', next.category);
      if (next.condition) params.set('condition', next.condition);
      if (next.sellerType) params.set('seller_type', next.sellerType);
      if (next.minPrice) params.set('min_price', next.minPrice);
      if (next.maxPrice) params.set('max_price', next.maxPrice);
      if (next.urgent) params.set('urgent', 'true');
      if (next.negotiable) params.set('negotiable', 'true');
      if (next.sort !== 'recent') params.set('sort', next.sort);

      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
      push({ ...filters, [key]: value });
    },
    [filters, push],
  );

  const clearFilters = useCallback(() => {
    push({
      ...filters,
      category: 'all',
      condition: '',
      sellerType: '',
      minPrice: '',
      maxPrice: '',
      urgent: false,
      negotiable: false,
    });
  }, [filters, push]);

  const clearListingOptions = useCallback(() => {
    push({ ...filters, urgent: false, negotiable: false });
  }, [filters, push]);

  const resetAll = useCallback(() => {
    const activeTab = searchParams.get('tab');
    const target = pathname === '/dashboard/market' && activeTab
      ? `${pathname}?tab=${encodeURIComponent(activeTab)}`
      : pathname;
    router.replace(target, { scroll: false });
  }, [pathname, router, searchParams]);

  return {
    filters,
    hasFilters: hasActiveFilters(filters),
    setFilter,
    clearFilters,
    clearListingOptions,
    resetAll,
  };
}
