import { Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/components/marketplace/format';
import { cn } from '@/lib/utils';
import type { BoostTier } from '@/components/marketplace/types';

interface BoostTierCardProps {
  tier: BoostTier;
  active: boolean;
  onSelect: (key: string) => void;
}

export function BoostTierCard({ tier, active, onSelect }: BoostTierCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(tier.key)}
      aria-pressed={active}
      className={cn(
        'relative flex w-full cursor-pointer flex-col gap-2.5 rounded-xl border-[1.5px] p-4 text-left transition-all',
        tier.surface,
        active ? 'ring-2 ring-primary/20' : 'border-border bg-card hover:border-primary-300',
      )}
    >
      {tier.popular && (
        <Badge className="absolute -top-[9px] right-3.5 bg-info text-white">
          Most Popular
        </Badge>
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-2',
          tier.popular && 'pr-[72px]',
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-xl">{tier.emoji}</span>
          <div>
            <p className={cn('m-0 text-sm font-semibold', tier.accent)}>{tier.label}</p>
            <p className="m-0 text-[11px] text-muted-foreground">{tier.duration}</p>
          </div>
        </div>
        <p className="m-0 text-base font-bold text-foreground">{formatPrice(tier.price)}</p>
      </div>

      <div className="flex flex-col gap-1">
        {tier.features.map((feature) => (
          <p
            key={feature}
            className="m-0 flex items-start gap-1.5 text-xs text-muted-foreground"
          >
            <Check className={cn('mt-0.5 size-3 shrink-0', tier.accent)} />
            {feature}
          </p>
        ))}
      </div>

      {active && (
        <span
          className={cn(
            'absolute right-4 top-4 flex size-5 items-center justify-center rounded-full text-[11px] text-white',
            tier.key === 'standard'
              ? 'bg-primary'
              : tier.key === 'featured'
                ? 'bg-accent'
                : 'bg-info',
          )}
        >
          <Check className="size-3" />
        </span>
      )}
    </button>
  );
}