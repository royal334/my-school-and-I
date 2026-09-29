'use client';

import { Suspense, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useMarketplaceFilters } from '@/hooks/use-marketplace-filters';

function MarketplaceSearchInput() {
  const { filters, setFilter } = useMarketplaceFilters();
  const [query, setQuery] = useState(filters.search);
  const [syncedSearch, setSyncedSearch] = useState(filters.search);

  // Re-sync when the URL changes (back/forward, clear filters, reset).
  if (filters.search !== syncedSearch) {
    setSyncedSearch(filters.search);
    setQuery(filters.search);
  }

  useEffect(() => {
    if (query === filters.search) return;
    const timer = setTimeout(() => setFilter('search', query), 400);
    return () => clearTimeout(timer);
  }, [query, filters.search, setFilter]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/60" />
      <input
        type="text"
        placeholder="Search listings…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-white/20 bg-white/10 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/50 focus:border-primary-300"
      />
    </div>
  );
}

export function MarketplaceSearch() {
  return (
    <Suspense fallback={<div className="h-10" />}>
      <MarketplaceSearchInput />
    </Suspense>
  );
}