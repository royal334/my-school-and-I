import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';

export function SavedListingsEmptyState() {
  return (
    <div className="flex flex-col items-center gap-3.5 px-6 py-12 text-center">
      <Heart className="size-8 text-muted-foreground/50" />
      <h2 className="text-xl font-semibold text-foreground">No saved listings</h2>
      <p className="max-w-65 text-sm leading-relaxed text-muted-foreground">
        Tap the heart on any listing to save it for later.
      </p>
      <Button asChild>
        <Link href={MARKETPLACE_BASE_PATH}>Browse marketplace</Link>
      </Button>
    </div>
  );
}