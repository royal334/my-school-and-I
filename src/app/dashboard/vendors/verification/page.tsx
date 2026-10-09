// app/dashboard/vendors/verification/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Crown, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { VendorVerificationForm } from '@/components/vendors/vendor-verification-form';
import { checkSubscriptionActive } from '@/utils/lib/vendor-features';

export const metadata = {
  title: 'Vendor Verification | Campus&Me',
  description: 'Request verification for your vendor profile',
};

export default async function VendorVerificationPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!vendor) {
    redirect('/dashboard/vendors/create');
  }

  const hasAccess =
    vendor.subscription_tier === 'featured' && checkSubscriptionActive(vendor);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
          Verify Your Business
        </h1>
        <p className="text-muted-foreground">
          Send your business details to our team to get verified.
        </p>
      </div>

      {hasAccess ? (
        <VendorVerificationForm
          vendorId={vendor.id}
          businessName={vendor.business_name}
          email={user.email ?? ''}
          phone={vendor.phone_number ?? ''}
          location={vendor.location ?? ''}
          tier={vendor.subscription_tier}
          isVerified={vendor.is_verified}
        />
      ) : (
        <Card className="border-border bg-card">
          <CardHeader className="items-center text-center">
            <div className="mx-auto w-fit rounded-full bg-accent-50 p-3 dark:bg-accent-500/15">
              {vendor.subscription_tier === 'featured' ? (
                <Lock className="h-8 w-8 text-destructive" />
              ) : (
                <Crown className="h-8 w-8 text-accent-600 dark:text-accent-400" />
              )}
            </div>
            <CardTitle className="text-lg">
              {vendor.subscription_tier === 'featured'
                ? 'Subscription Expired'
                : 'Featured Feature'}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {vendor.subscription_tier === 'featured'
                ? 'Renew your Featured plan to request vendor verification.'
                : 'Vendor verification requests are available on the Featured plan. Upgrade to get your verified badge.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Link href={`/dashboard/vendors/${vendor.id}/upgrade?tier=featured`}>
              <Button>
                <Crown className="mr-2 h-4 w-4" />
                {vendor.subscription_tier === 'featured'
                  ? 'Renew Featured Plan'
                  : 'Upgrade to Featured'}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
