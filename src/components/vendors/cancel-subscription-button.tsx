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
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function CancelSubscriptionButton({
  vendorId,
  tier,
  expiresAt,
  type = 'soft', // 'soft' or 'hard'
}: {
  vendorId: string;
  tier: string;
  expiresAt: string;
  type?: 'soft' | 'hard';
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const endpoint =
        type === 'soft'
          ? '/api/vendors/subscription/cancel-renewal'
          : '/api/vendors/subscription/cancel-immediate';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_id: vendorId }),
      });

      if (!response.ok) throw new Error('Cancellation failed');

      toast.success(
        type === 'soft'
          ? 'Auto-renewal cancelled'
          : 'Subscription cancelled immediately'
      );
      setOpen(false);
      window.location.reload();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = Math.ceil(
    (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <>
      <Button
        variant={type === 'soft' ? 'outline' : 'destructive'}
        onClick={() => setOpen(true)}
      >
        {type === 'soft' ? 'Cancel Auto-Renewal' : 'Cancel Immediately'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Confirm Cancellation
            </DialogTitle>
            <DialogDescription>
              {type === 'soft' ? (
                <>
                  Your {tier} subscription will remain active until{' '}
                  {new Date(expiresAt).toLocaleDateString()}.
                  <br />
                  <br />
                  After that date, you'll be downgraded to Basic and lose:
                  <ul className="mt-2 list-inside list-disc">
                    <li>Logo & cover image</li>
                    <li>Gallery photos</li>
                    <li>Daily/hourly analytics</li>
                    <li>Priority search ranking</li>
                  </ul>
                  <br />
                  No refund will be issued. You can reactivate anytime before
                  expiry.
                </>
              ) : (
                <>
                  <strong className="text-red-600">
                    Warning: Immediate Cancellation
                  </strong>
                  <br />
                  <br />
                  You will lose all {tier} features RIGHT NOW.
                  <br />
                  {daysRemaining} days remaining - no refund will be issued.
                  <br />
                  <br />
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : type === 'soft'
                ? 'Cancel Auto-Renewal'
                : 'Cancel Immediately'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}