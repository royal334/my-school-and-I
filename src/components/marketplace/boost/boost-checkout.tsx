'use client';

import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BOOST_TIERS } from '@/components/marketplace/constants';
import { MARKETPLACE_API_PATH } from '@/components/marketplace/filters';
import { formatPrice } from '@/components/marketplace/format';
import { BoostTierCard } from '@/components/marketplace/boost/boost-tier-card';
import { BoostSummary } from '@/components/marketplace/boost/boost-summary';

interface BoostCheckoutProps {
  listingId: string;
  listingTitle: string;
}

export function BoostCheckout({ listingId, listingTitle }: BoostCheckoutProps) {
  const [selectedTier, setSelectedTier] = useState('premium');
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');

  const tier = BOOST_TIERS.find((option) => option.key === selectedTier) ?? BOOST_TIERS[0];

  async function handleBoost() {
    if (paying) return;
    setPaying(true);
    setError('');

    try {
      const res = await fetch(`${MARKETPLACE_API_PATH}/boosts/initialize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          boost_tier: tier.key,
          price: tier.price,
          duration_hours: tier.hours,
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error(data.error || 'Could not start the payment');
      if (!data.authorization_url) throw new Error('Paystack did not return a checkout url');

      window.location.href = data.authorization_url;
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
      setPaying(false);
    }
  }

  return (
    <div className="pb-20">
      <div className="mb-5 flex flex-col gap-3">
        {BOOST_TIERS.map((option) => (
          <BoostTierCard
            key={option.key}
            tier={option}
            active={option.key === selectedTier}
            onSelect={setSelectedTier}
          />
        ))}
      </div>

      <BoostSummary listingTitle={listingTitle} tier={tier} />

      {error && <p className="mb-3 text-[13px] text-error">{error}</p>}

      <div className="border-border bg-background p-3">
        <Button type="button" onClick={handleBoost} disabled={paying} className="min-h-[52px] w-full">
          {paying ? 'Processing…' : `Pay ${formatPrice(tier.price)} with Paystack`}
        </Button>
        <p className="mt-2 flex items-center justify-center gap-1 text-center text-[11px] text-muted-foreground">
          <ShieldCheck className="size-3.5" />
          Secured by Paystack · Boost activates immediately after payment
        </p>
      </div>
    </div>
  );
}