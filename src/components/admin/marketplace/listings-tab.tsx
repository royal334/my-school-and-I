'use client';

import { useEffect, useState } from 'react';
import { Search, X } from 'lucide-react';
import { FilterChips } from './filter-chips';
import { AdminListingRow } from './admin-listing-row';
import { EmptyState } from './empty-state';
import { LoadingSkeleton } from './loading-skeleton';
import { LISTING_STATUS_FILTERS, getFilterLabel } from './constants';
import type { AdminListingSummary } from './types';

const SEARCH_DEBOUNCE_MS = 300;

interface ListingsTabProps {
  listings: AdminListingSummary[];
  loading: boolean;
  filter: string;
  onFilterChange: (value: string) => void;
  /** The committed (debounced) search term the list was fetched with. */
  search: string;
  onSearchChange: (value: string) => void;
  onRemove: (id: string) => void;
}

export function ListingsTab({
  listings,
  loading,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  onRemove,
}: ListingsTabProps) {
  // Local input state so typing stays responsive; the parent only refetches once
  // the debounced value settles.
  const [query, setQuery] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => onSearchChange(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, onSearchChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by title, seller or category…"
          aria-label="Search listings"
          className="w-full rounded-xl border border-input bg-card py-2.5 pr-9 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <FilterChips filters={LISTING_STATUS_FILTERS} value={filter} onChange={onFilterChange} />

      {loading ? (
        <LoadingSkeleton count={5} />
      ) : listings.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`No ${getFilterLabel(filter).toLowerCase()} listings found`}
          description={search ? `Nothing matches “${search}”.` : undefined}
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {listings.map((listing) => (
            <AdminListingRow key={listing.id} listing={listing} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
