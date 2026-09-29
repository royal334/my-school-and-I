'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ReportModal } from '@/components/marketplace/report-modal';

export function ReportListingButton({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={() => setOpen(true)}
      >
        <Flag />
        Report this listing
      </Button>

      {open && <ReportModal listingId={listingId} onClose={() => setOpen(false)} />}
    </>
  );
}