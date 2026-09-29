'use client';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LISTING_CATEGORIES } from '@/components/marketplace/constants';
import { cn } from '@/lib/utils';
import type { ListingDraft } from '@/components/marketplace/types';

interface ListingDetailsStepProps {
  draft: ListingDraft;
  onChange: (patch: Partial<ListingDraft>) => void;
}

const fieldLabel = 'mb-1 block text-sm font-medium text-foreground';
const required = 'text-accent-600 dark:text-accent-400';

export function ListingDetailsStep({ draft, onChange }: ListingDetailsStepProps) {
  return (
    <div className="flex flex-col gap-4.5">
      <div>
        <label className={fieldLabel}>
          Title <span className={required}>*</span>
        </label>
        <Input
          placeholder="e.g. Samsung Galaxy A53 — 6 months old"
          value={draft.title}
          onChange={(event) => onChange({ title: event.target.value })}
          maxLength={150}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">{draft.title.length}/150</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">
          Category <span className={required}>*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {LISTING_CATEGORIES.map((category) => {
            const active = draft.category === category.key;
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => onChange({ category: category.key })}
                aria-pressed={active}
                className={cn(
                  'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                  active
                    ? 'border-primary-600 bg-primary-600 text-white shadow-sm'
                    : 'border-transparent bg-muted text-foreground hover:bg-muted/70',
                )}
              >
                {category.emoji} {category.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={fieldLabel}>Description</label>
        <Textarea
          className="resize-y"
          placeholder="Describe your item — age, specs, reason for selling, any faults…"
          rows={4}
          value={draft.description}
          onChange={(event) => onChange({ description: event.target.value })}
        />
      </div>

      <div>
        <label className={fieldLabel}>Meetup location</label>
        <Input
          placeholder="e.g. Near UNIZIK main gate, Ifite-Awka"
          value={draft.location}
          onChange={(event) => onChange({ location: event.target.value })}
        />
      </div>
    </div>
  );
}