import type { SellerSlots } from '@/components/marketplace/types';
import { cn } from '@/lib/utils';

interface SlotCounterProps {
  slots: SellerSlots;
}

/** Pips showing how many of the seller's active-listing slots are in use. */
export function SlotCounter({ slots }: SlotCounterProps) {
  return (
    <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2.5">
      <p className="text-xs text-muted-foreground">
        Active listings: {slots.active_listings} / {slots.max_listings}
      </p>
      <div className="flex gap-1">
        {Array.from({ length: slots.max_listings }, (_, index) => (
          <div
            key={index}
            className={cn(
              'size-2.5 rounded-full',
              index < slots.active_listings ? 'bg-primary' : 'bg-muted-foreground/25',
            )}
          />
        ))}
      </div>
    </div>
  );
}