// components/vendors/premium-gate.tsx
'use client';

import { ReactNode } from 'react';
import { Lock, Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useVendorFeatures, VendorTier } from '@/hooks/use-vendor-features';

interface PremiumGateProps {
  vendor: any;
  requiredTier: 'premium' | 'featured';
  featureName: string;
  children: ReactNode;
  showPreview?: boolean;
  className?: string;
}

export default function PremiumGate({
  vendor,
  requiredTier,
  featureName,
  children,
  showPreview = true,
  className = '',
}: PremiumGateProps) {
  const features = useVendorFeatures(vendor);

  // Tier hierarchy: basic < premium < featured
  const tierLevel: Record<VendorTier, number> = {
    basic: 0,
    premium: 1,
    featured: 2,
  };

  const requiredLevel = tierLevel[requiredTier];
  const currentLevel = tierLevel[features.tier];
  const hasAccess = currentLevel >= requiredLevel;

  // If has access, show the feature
  if (hasAccess && features.isActive) {
    return <>{children}</>;
  }

  // If subscription expired, show expiry message
  if (features.isExpired && vendor.subscription_tier !== 'basic') {
    return (
      <div className={`relative ${className}`}>
        {showPreview && (
          <div className="pointer-events-none blur-sm opacity-50">{children}</div>
        )}

        <div
          className={`${
            showPreview ? 'absolute inset-0' : ''
          } flex flex-col items-center justify-center rounded-lg bg-white/90 p-8 backdrop-blur-sm`}
        >
          <div className="max-w-sm space-y-4 text-center">
            <div className="mx-auto w-fit rounded-full bg-red-100 p-3">
              <Lock className="h-8 w-8 text-red-600" />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Subscription Expired</h3>
              <p className="mt-1 text-sm text-slate-600">
                Your {vendor.subscription_tier} subscription has expired. Renew to
                continue using {featureName}.
              </p>
            </div>

            <Link href={`/dashboard/vendors/${vendor.id}/upgrade?tier=${vendor.subscription_tier}`}>
              <Button className="w-full">Renew Subscription</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show upgrade gate
  const icon = requiredTier === 'featured' ? Crown : Sparkles;
  const IconComponent = icon;
  const color = requiredTier === 'featured' ? 'amber' : 'blue';

  return (
    <div className={`relative ${className}`}>
      {showPreview && (
        <div className="pointer-events-none blur-sm opacity-50">{children}</div>
      )}

      <div
        className={`${
          showPreview ? 'absolute inset-0' : ''
        } flex flex-col items-center justify-center rounded-lg bg-white/90 p-8 backdrop-blur-sm`}
      >
        <div className="max-w-sm space-y-4 text-center">
          <div
            className={`mx-auto w-fit rounded-full p-3 ${
              color === 'amber' ? 'bg-amber-100' : 'bg-blue-100'
            }`}
          >
            <IconComponent
              className={`h-8 w-8 ${
                color === 'amber' ? 'text-amber-600' : 'text-blue-600'
              }`}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">
              {requiredTier === 'featured' ? 'Featured' : 'Premium'} Feature
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Upgrade to {requiredTier === 'featured' ? 'Featured' : 'Premium'} to
              unlock <strong>{featureName}</strong>
            </p>
          </div>

          {/* Feature benefits */}
          <div className="rounded-lg bg-slate-50 p-4 text-left">
            <p className="text-xs font-medium text-slate-700">
              {requiredTier === 'featured' ? 'Featured' : 'Premium'} includes:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {requiredTier === 'premium' ? (
                <>
                  <li>• Logo & cover image</li>
                  <li>• 5 photo gallery</li>
                  <li>• Up to 15 services</li>
                  <li>• 2x search priority</li>
                  <li>• Daily analytics</li>
                </>
              ) : (
                <>
                  <li>• Verified badge ✓</li>
                  <li>• 10 photo gallery</li>
                  <li>• Unlimited services</li>
                  <li>• Top of all searches</li>
                  <li>• Hourly analytics</li>
                  <li>• 500 SMS credits/month</li>
                </>
              )}
            </ul>
          </div>

          <Link href={`/dashboard/vendors/${vendor.id}/upgrade?tier=${requiredTier}`}>
            <Button className="w-full">
              Upgrade to {requiredTier === 'featured' ? 'Featured' : 'Premium'}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}