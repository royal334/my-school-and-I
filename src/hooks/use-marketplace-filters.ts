'use client';

import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  DEFAULT_MARKETPLACE_FILTERS,
  hasActiveFilters,
  marketplaceQueryString,
  parseMarketplaceFilters,
} from '@/components/marketplace/filters';
import type { MarketplaceFilters } from '@/components/marketplace/types';

/**
 * Keeps the marketplace browse state in the URL so the feed can be rendered on
 * the server (and shared/bookmarkable) while the controls stay interactive.
 *
 * `router.replace` only lands after an RSC round trip, so `searchParams` lags
 * behind fast interactions (price keystrokes, the debounced search, pill
 * clicks). Mutations are merged into a pending snapshot stored outside React:
 * the filter panel, the search box and the price fields are separate hook
 * instances, and every one of them must see updates that are still in flight —
 * otherwise an update built from the stale committed state cancels the one
 * before it (e.g. picking a category right after typing a search drops the
 * category again).
 */
type PendingUpdate = { query: string; filters: MarketplaceFilters };

let pendingUpdate: PendingUpdate | null = null;
let lastCommittedQuery: string | null = null;

export function useMarketplaceFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, forceRender] = useReducer((count: number) => count + 1, 0);

  const committedFilters = useMemo(
    () => parseMarketplaceFilters(searchParams as unknown as Record<string, string | string[] | undefined>),
    [searchParams],
  );

  // Drop the pending snapshot once the URL it was pushed for has landed (or
  // navigation happened elsewhere, e.g. back/forward). Event handlers only run
  // in the browser, so on the server this just resolves to committed state.
  // The cleanup lives in an effect (not render): mutating module state during
  // render is a side effect and is rejected by react-hooks/globals.
  const committedQuery = marketplaceQueryString(committedFilters);
  useEffect(() => {
    const urlChanged = lastCommittedQuery !== committedQuery;
    const landed = pendingUpdate !== null && pendingUpdate.query === committedQuery;
    if (!urlChanged && !landed) return;
    const wasStale = pendingUpdate !== null && pendingUpdate.query !== committedQuery;
    lastCommittedQuery = committedQuery;
    pendingUpdate = null;
    // The render that just happened may have shown the now-dropped snapshot.
    if (wasStale) forceRender();
  }, [committedQuery, forceRender]);
  const filters = pendingUpdate?.filters ?? committedFilters;

  const push = useCallback(
    (next: MarketplaceFilters) => {
      const query = marketplaceQueryString(next);
      pendingUpdate = { query, filters: next };
      forceRender();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) => {
      push({ ...(pendingUpdate?.filters ?? filters), [key]: value });
    },
    [filters, push],
  );

  const clearFilters = useCallback(() => {
    push({
      ...(pendingUpdate?.filters ?? filters),
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
    push({ ...(pendingUpdate?.filters ?? filters), urgent: false, negotiable: false });
  }, [filters, push]);

  const resetAll = useCallback(() => {
    const activeTab = searchParams.get('tab');
    pendingUpdate = { query: '', filters: DEFAULT_MARKETPLACE_FILTERS };
    forceRender();
    const target =
      pathname === '/dashboard/market' && activeTab
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
