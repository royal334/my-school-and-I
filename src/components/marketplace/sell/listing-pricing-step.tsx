'use client';

import { Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { LISTING_CONDITION_OPTIONS } from '@/components/marketplace/constants';
import { cn } from '@/lib/utils';
import type { ListingDraft } from '@/components/marketplace/types';

interface ListingPricingStepProps {
  draft: ListingDraft;
  onChange: (patch: Partial<ListingDraft>) => void;
}

const required = 'text-accent-600 dark:text-accent-400';

export function ListingPricingStep({ draft, onChange }: ListingPricingStepProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-2.5 block text-sm font-medium text-foreground">
          Condition <span className={required}>*</span>
        </label>
        <div className="flex flex-col gap-2">
          {LISTING_CONDITION_OPTIONS.map((option) => {
            const active = draft.condition === option.key;
            return (
              <button
                key={option.key}
                type="button"
                onClick={() => onChange({ condition: option.key })}
                aria-pressed={active}
                className={cn(
                  'flex flex-col gap-0.5 rounded-lg border px-3.5 py-3 text-left text-[13px] transition-all',
                  active
                    ? 'border-primary-500 bg-primary-500/5 font-medium text-primary'
                    : 'border-border bg-card text-foreground hover:border-primary-300',
                )}
              >
                <span className="font-medium">{option.label}</span>
                <span className="text-[11px] font-normal text-muted-foreground">
                  {option.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Price (₦) <span className={required}>*</span>
        </label>
        <Input
          type="number"
          inputMode="numeric"
          placeholder="e.g. 45000"
          value={draft.price}
          onChange={(event) => onChange({ price: event.target.value })}
        />
      </div>

      <ToggleRow
        checked={draft.negotiable}
        onChange={() => onChange({ negotiable: !draft.negotiable })}
        title="Negotiable"
        hint="Buyers can make offers"
        activeClass="border-primary-500 bg-primary-500/5"
        checkClass="bg-primary text-primary-foreground"
      />

      <ToggleRow
        checked={draft.isUrgent}
        onChange={() => onChange({ isUrgent: !draft.isUrgent })}
        title="⚡ Urgent sale"
        hint="You want to sell quickly"
        activeClass="border-error/40 bg-error-bg text-error-text"
        checkClass="bg-error text-white"
      />
    </div>
  );
}

function ToggleRow({
  checked,
  onChange,
  title,
  hint,
  activeClass,
  checkClass,
}: {
  checked: boolean;
  onChange: () => void;
  title: string;
  hint: string;
  activeClass: string;
  checkClass: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={cn(
        'flex items-center gap-3 rounded-lg border px-3.5 py-3 text-left transition-colors',
        checked ? activeClass : 'border-border bg-card',
      )}
    >
      <span
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded border transition-colors',
          checked ? `${checkClass} border-transparent` : 'border-border bg-background text-transparent',
        )}
      >
        <Check className="size-3.5" />
      </span>
      <span>
        <span className={cn('block text-[13px] font-medium', checked ? '' : 'text-foreground')}>
          {title}
        </span>
        <span className="block text-[11px] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}