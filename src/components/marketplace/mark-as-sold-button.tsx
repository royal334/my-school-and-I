'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export function MarkAsSoldButton({ listingId }: { listingId: string }) {
  const router = useRouter();

  async function markAsSold() {
    if (!window.confirm('Mark this listing as sold?')) return;

    try {
      const res = await fetch(`/api/marketplace/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' }),
      });
      if (!res.ok) throw new Error('Request failed');

      toast.success('Listing marked as sold');
      router.refresh();
    } catch {
      toast.error('Could not update the listing. Please try again.');
    }
  }

  return (
    <Button variant="outline" className="flex-1" onClick={markAsSold}>
      <CheckCircle2 />
      Mark as sold
    </Button>
  );
}