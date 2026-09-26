'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Search, X, SlidersHorizontal, Check } from 'lucide-react';

const ROOM_TYPES = [
  'self-contained',
  'single room',
  'shared room',
  '1-bedroom',
  '2-bedroom',
];

interface ListingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  roomType: string;
  onRoomTypeChange: (value: string) => void;
  minPrice: string;
  onMinPriceChange: (value: string) => void;
  maxPrice: string;
  onMaxPriceChange: (value: string) => void;
  hasWater: boolean;
  onToggleWater: () => void;
  hasElectricity: boolean;
  onToggleElectricity: () => void;
  hasSecurity: boolean;
  onToggleSecurity: () => void;
  hasActiveFilters: boolean;
  activeCount: number;
  onClearFilters: () => void;
}

export function ListingFilters({
  search,
  onSearchChange,
  roomType,
  onRoomTypeChange,
  minPrice,
  onMinPriceChange,
  maxPrice,
  onMaxPriceChange,
  hasWater,
  onToggleWater,
  hasElectricity,
  onToggleElectricity,
  hasSecurity,
  onToggleSecurity,
  hasActiveFilters,
  activeCount,
  onClearFilters,
}: ListingFiltersProps) {
  const [open, setOpen] = useState(false);

  const facilityFilters = [
    { label: 'Water', active: hasWater, onToggle: onToggleWater },
    { label: 'Electricity', active: hasElectricity, onToggle: onToggleElectricity },
    { label: 'Security', active: hasSecurity, onToggle: onToggleSecurity },
  ];

  const priceShown = Boolean(minPrice || maxPrice);
  const priceLabel =
    minPrice && maxPrice
      ? `₦${minPrice} – ₦${maxPrice}`
      : minPrice
        ? `≥ ₦${minPrice}`
        : maxPrice
          ? `≤ ₦${maxPrice}`
          : '';

  const rowClass = (selected: boolean) =>
    `flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
      selected
        ? 'bg-muted text-foreground font-medium'
        : 'text-muted-foreground hover:bg-muted'
    }`;

  const activeFacilities = facilityFilters.filter((f) => f.active);

  return (
    <div className="space-y-3">
      {/* Search Bar + Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lodges, areas or landmarks…"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="default"
              className={`shrink-0 ${
                hasActiveFilters
                  ? 'border-primary bg-primary-50 text-primary-900 dark:border-primary-400 dark:bg-primary-950/50 dark:text-primary-100'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
              {activeCount > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground dark:bg-accent-400 dark:text-accent-foreground">
                  {activeCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-72 p-2"
          >
            {/* Room type */}
            <p className="px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Room type
            </p>
            <div className="space-y-0.5">
              <button
                onClick={() => {
                  onRoomTypeChange('');
                  setOpen(false);
                }}
                className={rowClass(roomType === '')}
              >
                <span className="flex-1 text-left">Any</span>
                {roomType === '' && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
              {ROOM_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    onRoomTypeChange(type);
                    setOpen(false);
                  }}
                  className={rowClass(roomType === type)}
                >
                  <span className="flex-1 text-left capitalize">{type}</span>
                  {roomType === type && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
            </div>

            {/* Budget */}
            <p className="mt-4 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Budget (₦/year)
            </p>
            <div className="space-y-2 px-2 pb-1">
              <Input
                type="number"
                min={0}
                placeholder="Minimum"
                value={minPrice}
                onChange={(e) => onMinPriceChange(e.target.value)}
                className="h-9"
              />
              <Input
                type="number"
                min={0}
                placeholder="Maximum"
                value={maxPrice}
                onChange={(e) => onMaxPriceChange(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Facilities */}
            <p className="mt-4 px-2 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Facilities
            </p>
            <div className="flex flex-wrap gap-1.5 px-2 pb-2">
              {facilityFilters.map(({ label, active, onToggle }) => (
                <button
                  key={label}
                  onClick={onToggle}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground dark:border-accent-400 dark:bg-accent-400 dark:text-accent-foreground'
                      : 'border-border bg-muted text-foreground hover:bg-muted/70'
                  }`}
                >
                  {active ? '✓ ' : ''}
                  {label}
                </button>
              ))}
            </div>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  onClearFilters();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-sm font-medium text-error-text hover:bg-error-bg"
              >
                <X className="h-4 w-4" />
                Clear all filters
              </button>
            )}
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter indicator */}
      {(roomType || priceShown || activeFacilities.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>Showing:</span>
          {roomType && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-foreground">
              {roomType}
              <button
                onClick={() => onRoomTypeChange('')}
                aria-label="Remove room type filter"
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {priceShown && (
            <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground">
              {priceLabel}
              <button
                onClick={() => {
                  onMinPriceChange('');
                  onMaxPriceChange('');
                }}
                aria-label="Remove budget filter"
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {activeFacilities.map(({ label, onToggle }) => (
            <span
              key={label}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground"
            >
              {label}
              <button
                onClick={onToggle}
                aria-label={`Remove ${label} filter`}
                className="ml-0.5 rounded-full p-0.5 hover:bg-background/70"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
