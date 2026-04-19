'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface UpgradeFormProps {
  vendor: any;
  preSelectedTier?: 'premium' | 'featured';
}

const PRICING = {
  premium: {
    name: 'Premium',
    price: 2000,
    period: 'month',
    description: 'Perfect for growing businesses',
    icon: Sparkles,
    color: 'blue',
    features: [
      'Business logo upload',
      'Cover image',
      '5 photo gallery images',
      'Up to 15 services',
      'Priority in search (2x boost)',
      'Daily analytics',
      'Contact breakdown (phone vs WhatsApp)',
      // 'Email support (48hr response)',
      // '5 quick reply templates',
      // 'Premium badge',
    ],
  },
  featured: {
    name: 'Featured',
    price: 5000,
    period: 'month',
    description: 'Maximum visibility and features',
    icon: Crown,
    color: 'amber',
    popular: true,
    features: [
      'Everything in Premium',
      //'Verified badge ✓',
      '10 photo gallery images',
      'Unlimited services',
      'Top of all searches (10x boost)',
      // 'Homepage spotlight',
      'Hourly analytics',
      // 'Traffic sources breakdown',
      // 'Competitor insights',
      // '500 SMS credits/month',
      // 'Unlimited quick reply templates',
      // 'Priority support (24hr response)',
      'Review response feature',
      // 'Custom theme color',
    ],
  },
};

export default function UpgradeForm({ vendor, preSelectedTier }: UpgradeFormProps) {
  const [loadingTier, setLoadingTier] = useState<'premium' | 'featured' | null>(null);

  const handleUpgrade = async (tier: 'premium' | 'featured') => {
    setLoadingTier(tier);

    try {
      // Initialize payment
      const response = await fetch('/api/vendors/subscribe/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_id: vendor.id,
          tier: tier,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to initialize payment');
      }

      const { authorization_url } = await response.json();

      // Redirect to Paystack
      window.location.href = authorization_url;
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || 'Failed to process upgrade');
      setLoadingTier(null);
    }
  };

  const isCurrentPlan = (tier: string) => vendor.subscription_tier === tier;

  const canUpgrade = (tier: 'premium' | 'featured') => {
    if (vendor.subscription_tier === 'basic') return true;
    if (vendor.subscription_tier === 'premium' && tier === 'featured') return true;
    return false;
  };

  const renderTierCard = (tierKey: 'premium' | 'featured') => {
    const tier = PRICING[tierKey];
    const Icon = tier.icon;
    const isCurrent = isCurrentPlan(tierKey);
    const upgradable = canUpgrade(tierKey);
    const isLoading = loadingTier === tierKey;

    return (
      <Card
        className={`relative flex flex-col transition-all ${
          upgradable ? 'hover:shadow-lg' : 'opacity-80'
        } ${tierKey === 'featured' ? 'border-amber-200' : 'border-blue-200'}`}
      >
        {tierKey === 'featured' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-amber-500 text-white">Most Popular</Badge>
          </div>
        )}

        <CardHeader>
          <div className="flex items-center gap-2">
            <div className={`rounded-full p-2 ${tierKey === 'featured' ? 'bg-amber-100' : 'bg-blue-100'}`}>
              <Icon className={`h-5 w-5 ${tierKey === 'featured' ? 'text-amber-600' : 'text-blue-600'}`} />
            </div>
            <CardTitle>{tier.name}</CardTitle>
          </div>
          <p className="text-sm text-slate-600">{tier.description}</p>
        </CardHeader>

        <CardContent className="flex-1 space-y-6">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">₦{tier.price.toLocaleString()}</span>
              <span className="text-slate-600">/{tier.period}</span>
            </div>
          </div>

          <div className="space-y-2">
            {tier.features.map((feature, index) => (
              <div key={index} className="flex items-start gap-2">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                <span className="text-sm text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </CardContent>

        <div className="p-6 pt-0 mt-auto">
          <Button
            onClick={() => handleUpgrade(tierKey)}
            disabled={!!loadingTier || !upgradable}
            className={`w-full ${
              tierKey === 'featured' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : isCurrent ? (
              'Current Plan'
            ) : upgradable ? (
              `Upgrade to ${tier.name}`
            ) : (
              'Not Available'
            )}
          </Button>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {renderTierCard('premium')}
        {renderTierCard('featured')}
      </div>

      <p className="text-center text-xs text-slate-600">
        Secure payment powered by Paystack. Your subscription will be active immediately after payment.
      </p>
    </div>
  );
}