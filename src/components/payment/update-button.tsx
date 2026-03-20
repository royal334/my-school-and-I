'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CreditCard, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradeButtonProps {
  variant?: 'default' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

export default function UpgradeButton({
  variant = 'default',
  className,
  children,
}: UpgradeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to Paystack
      window.location.href = data.authorization_url;
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to start payment');
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      className={className}
      onClick={handleUpgrade}
      disabled={loading}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <CreditCard className="mr-2 h-4 w-4" />
          {children || 'Upgrade to Premium - ₦1000'}
        </>
      )}
    </Button>
  );
}