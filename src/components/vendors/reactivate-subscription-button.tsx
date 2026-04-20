'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export default function ReactivateSubscriptionButton({
  vendorId,
  tier,
  expiresAt,
}: {
  vendorId: string;
  tier: string;
  expiresAt: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReactivate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/vendors/subscription/reactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Reactivation failed');
      }

      toast.success('Auto-renewal reactivated successfully');
      setOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to reactivate subscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-primary hover:text-primary"
        onClick={() => setOpen(true)}
      >
        Reactivate Auto-Renewal
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-primary" />
              Reactivate Auto-Renewal
            </DialogTitle>
            <DialogDescription>
              By reactivating, your <strong>{tier}</strong> subscription will
              automatically renew on{' '}
              <strong>{new Date(expiresAt).toLocaleDateString()}</strong>.
              <br />
              <br />
              You will continue to have uninterrupted access to:
              <ul className="mt-2 list-inside list-disc">
                <li>Logo & cover image</li>
                <li>Gallery photos</li>
                <li>Daily/hourly analytics</li>
                <li>Priority search ranking</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep as is
            </Button>
            <Button onClick={handleReactivate} disabled={loading}>
              {loading ? 'Reactivating...' : 'Confirm Reactivation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
