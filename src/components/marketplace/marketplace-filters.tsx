'use client';

import { Suspense, useEffect, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useMarketplaceFilters } from '@/hooks/use-marketplace-filters';
import {
  CATEGORIES,
  CONDITIONS,
  SELLER_TYPE_OPTIONS,
  SORT_OPTIONS,
  getConditionLabel,
} from '@/components/marketplace/constants';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters'
import { Heart } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button';
import type { MarketplaceSort } from '@/components/marketplace/types';

const activePill =
  'border-primary-600 bg-primary-600 text-white shadow-sm';
const inactivePill =
  'border-transparent bg-muted text-foreground hover:bg-muted/70';
const activePillStyle = {
  borderColor: 'var(--color-primary-600)',
  backgroundColor: 'var(--color-primary-600)',
  color: '#fff',
};

const fieldClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary-500';

function PriceField({
  filterKey,
  placeholder,
  ariaLabel,
}: {
  filterKey: 'minPrice' | 'maxPrice';
  placeholder: string;
  ariaLabel: string;
}) {
  const { filters, setFilter } = useMarketplaceFilters();
  const committed = filters[filterKey];
  const [draft, setDraft] = useState(committed);
  const [synced, setSynced] = useState(committed);

  // Re-sync when the URL changes (back/forward, clear filters, reset).
  if (committed !== synced) {
    setSynced(committed);
    setDraft(committed);
  }

  useEffect(() => {
    if (draft === committed) return;
    const timer = setTimeout(() => setFilter(filterKey, draft), 400);
    return () => clearTimeout(timer);
  }, [draft, committed, filterKey, setFilter]);

  return (
    <input
      type="number"
      inputMode="numeric"
      placeholder={placeholder}
      aria-label={ariaLabel}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      className={fieldClass}
    />
  );
}

function MarketplaceFiltersPanel() {
  const {
    filters,
    hasFilters,
    setFilter,
    clearFilters,
    clearListingOptions,
    resetAll,
  } = useMarketplaceFilters();
  const [open, setOpen] = useState(hasFilters);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2.5 sm:items-center">
      {/* Filter toggle + sort */}
      <div className="flex items-center gap-2 overflow-x-auto">
        <button
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
          className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
            hasFilters ? activePill : inactivePill
          }`}
          style={hasFilters ? activePillStyle : undefined}
        >
          <SlidersHorizontal className="size-4" />
          Filters 
          {/* {hasFilters ? '·' : ''} */}
        </button>

        {hasFilters && (
          <Button
            onClick={clearFilters}
            className="bg-accent text-accent-950 hover:bg-accent-600 hover:text-accent-50"
          >
            Clear filters
          </Button>
        )}

        <select
          value={filters.sort}
          onChange={(e) => setFilter('sort', e.target.value as MarketplaceSort)}
          aria-label="Sort listings"
          className={`rounded-md border px-2.5 py-2 text-sm outline-none ${
            filters.sort !== 'recent' ? activePill : inactivePill
          }`}
          style={filters.sort !== 'recent' ? activePillStyle : undefined}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button
          asChild
          size="sm"
          className="bg-accent text-accent-950 hover:bg-accent-600 hover:text-accent-50"
        >
          <Link href={`${MARKETPLACE_BASE_PATH}/saved`}>
            <Heart className="size-3.5 fill-current" />
            Saved
          </Link>
        </Button>
      </div>

      {/* Expanded filters */}
      {open && (
        <div className="flex flex-col gap-3.5 border-t border-border pt-3 sm:pl-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Category
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const active = filters.category === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setFilter('category', cat.key)}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                      active ? activePill : inactivePill
                    }`}
                    style={active ? activePillStyle : undefined}
                  >
                    <span aria-hidden="true">{cat.emoji}</span>
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Price (₦)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <PriceField filterKey="minPrice" placeholder="Min" ariaLabel="Minimum price" />
              <PriceField filterKey="maxPrice" placeholder="Max" ariaLabel="Maximum price" />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Condition
            </p>
            <div className="flex flex-wrap gap-1.5">
              {CONDITIONS.map((condition) => (
                <button
                  key={condition}
                  onClick={() =>
                    setFilter('condition', filters.condition === condition ? '' : condition)
                  }
                  aria-pressed={filters.condition === condition}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.condition === condition ? activePill : inactivePill
                  }`}
                  style={filters.condition === condition ? activePillStyle : undefined}
                >
                  {getConditionLabel(condition)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Seller
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SELLER_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.key || 'all'}
                  onClick={() => setFilter('sellerType', option.key)}
                  aria-pressed={filters.sellerType === option.key}
                  className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                    filters.sellerType === option.key ? activePill : inactivePill
                  }`}
                  style={filters.sellerType === option.key ? activePillStyle : undefined}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Listing options
            </p>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={clearListingOptions}
                aria-pressed={!filters.urgent && !filters.negotiable}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  !filters.urgent && !filters.negotiable ? activePill : inactivePill
                }`}
                style={!filters.urgent && !filters.negotiable ? activePillStyle : undefined}
              >
                All
              </button>
              <button
                onClick={() => setFilter('urgent', !filters.urgent)}
                aria-pressed={filters.urgent}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.urgent ? activePill : inactivePill
                }`}
                style={filters.urgent ? activePillStyle : undefined}
              >
                Urgent only
              </button>
              <button
                onClick={() => setFilter('negotiable', !filters.negotiable)}
                aria-pressed={filters.negotiable}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  filters.negotiable ? activePill : inactivePill
                }`}
                style={filters.negotiable ? activePillStyle : undefined}
              >
                Negotiable only
              </button>
            </div>
          </div>

        </div>
      )}

      {/* Escape hatch: drop search + sort too */}
      {(filters.search || filters.sort !== 'recent') && (
        <button
          onClick={resetAll}
          className="p-0 text-left text-xs text-primary sm:ml-auto sm:shrink-0"
        >
          Reset search &amp; sort
        </button>
      )}
    </div>
  );
}

export function MarketplaceFilters() {
  return (
    <Suspense fallback={<div className="h-14" />}>
      <MarketplaceFiltersPanel />
    </Suspense>
  );
}