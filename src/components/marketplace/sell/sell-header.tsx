'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SELL_STEPS } from '@/components/marketplace/constants';
import { cn } from '@/lib/utils';

interface SellHeaderProps {
  step: number;
  isEditing: boolean;
  onBack: () => void;
}

/** Primary header with the wizard title and the filled/unfilled step bar. */
export function SellHeader({ step, isEditing, onBack }: SellHeaderProps) {
  return (
    <div className="bg-primary p-4 dark:bg-primary-900">
      <div className="mb-1.5 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          aria-label="Go back"
          className="text-primary-foreground hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h1 className="text-lg font-semibold text-white">
            {isEditing ? 'Edit listing' : 'Sell something'}
          </h1>
          <p className="text-xs text-white/70">
            Step {step + 1} of {SELL_STEPS.length} — {SELL_STEPS[step]}
          </p>
        </div>
      </div>

      <div className="mt-2 flex gap-1">
        {SELL_STEPS.map((label, index) => (
          <div
            key={label}
            className={cn(
              'h-[3px] flex-1 rounded-full transition-colors duration-300',
              index <= step ? 'bg-accent-400' : 'bg-white/20',
            )}
          />
        ))}
      </div>
    </div>
  );
}