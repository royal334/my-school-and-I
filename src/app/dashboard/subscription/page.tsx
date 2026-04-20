import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, CreditCard, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import CancelSubscriptionButton from '@/components/vendors/cancel-subscription-button';
import ReactivateSubscriptionButton from '@/components/vendors/reactivate-subscription-button';

export const metadata = {
  title: 'Subscription | UniHub',
  description: 'Manage your subscription',
};

export default async function SubscriptionPage() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!vendor) {
    redirect('/dashboard/vendors/create');
  }

  // Get subscription history
  const { data: history } = await supabase
    .from('vendor_subscription_history')
    .select('*')
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const isActive = vendor.subscription_tier !== 'basic' && 
    vendor.subscription_expires_at &&
    new Date(vendor.subscription_expires_at) > new Date();

  const autoRenewOn = vendor.subscription_auto_renew;

  const daysUntilExpiry = vendor.subscription_expires_at
    ? Math.ceil(
        (new Date(vendor.subscription_expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-slate-600">Manage your subscription plan</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  className={`text-lg uppercase ${
                    vendor.subscription_tier === 'featured'
                      ? 'bg-amber-500'
                      : vendor.subscription_tier === 'premium'
                      ? 'bg-blue-500'
                      : 'bg-slate-500'
                  }`}
                >
                  {vendor.subscription_tier === 'featured' && (
                    <Crown className="mr-1 h-4 w-4" />
                  )}
                  {vendor.subscription_tier}
                </Badge>
                {isActive && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    Active
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">
                {vendor.subscription_tier === 'basic'
                  ? 'Free plan with basic features'
                  : vendor.subscription_tier === 'premium'
                  ? '₦2,000/month - Enhanced visibility and features'
                  : '₦5,000/month - Maximum visibility and all features'}
              </p>
            </div>

            {isActive ? (
              <div className='flex gap-3'>
              <Link href={`/dashboard/vendors/${vendor.id}/upgrade`}>
                <Button variant="outline">Change Plan</Button>
              </Link>
            {autoRenewOn   ? (         
            <>
              <CancelSubscriptionButton
                vendorId={vendor.id}
                tier={vendor.subscription_tier}
                expiresAt={vendor.subscription_expires_at}
                type="hard"/>
              
                <CancelSubscriptionButton
                vendorId={vendor.id}
                tier={vendor.subscription_tier}
                expiresAt={vendor.subscription_expires_at}
                type="soft"
              />
            </>
            ) : (
              <ReactivateSubscriptionButton
              vendorId={vendor.id}
              tier={vendor.subscription_tier}
              expiresAt={vendor.subscription_expires_at}
            />
            )}
            </div>
            ) : (
              <Link href={`/dashboard/vendors/${vendor.id}/upgrade`}>
              <Button>
                <Crown className="mr-2 h-4 w-4" />
                Upgrade Plan
              </Button>
            </Link>
            )}
          </div>

          {isActive && (
            <div className="space-y-3 rounded-lg border bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Subscription Period</p>
                  <p className="text-sm text-slate-600">
                    Started: {new Date(vendor.subscription_starts_at!).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-slate-600">
                    Renews: {new Date(vendor.subscription_expires_at!).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {daysUntilExpiry <= 7 && (
                <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900">
                      Subscription Expiring Soon
                    </p>
                    <p className="text-sm text-amber-700">
                      Your subscription expires in {daysUntilExpiry} day(s)
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Basic */}
            <div className="rounded-lg border p-4">
              <h3 className="font-semibold">Basic (Free)</h3>
              <ul className="mt-2 space-y-1 text-sm text-slate-600">
                <li>• Up to 5 services</li>
                <li>• Basic visibility</li>
                <li>• Customer reviews</li>
              </ul>
            </div>

            {/* Premium */}
            <div className="rounded-lg border p-4 border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-blue-900">Premium (₦2,000/month)</h3>
                {vendor.subscription_tier === 'premium' && (
                  <Badge variant="outline">Current</Badge>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-sm text-blue-800">
                <li>• Logo & cover image</li>
                <li>• 5 photo gallery</li>
                <li>• Up to 10 services</li>
                <li>• Priority in search (2x)</li>
                <li>• Daily analytics</li>
              </ul>
            </div>

            {/* Featured */}
            <div className="rounded-lg border p-4 border-amber-200 bg-amber-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-900">
                  Featured (₦5,000/month)
                </h3>
                {vendor.subscription_tier === 'featured' && (
                  <Badge variant="outline">Current</Badge>
                )}
              </div>
              <ul className="mt-2 space-y-1 text-sm text-amber-800">
                <li>• Everything in Premium</li>
                <li>• Verified badge ✓</li>
                <li>• 10 photo gallery</li>
                <li>• Unlimited services</li>
                <li>• Top of search results (10x)</li>
                <li>• Hourly analytics</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription History */}
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <p className="font-medium">
                        {item.tier.charAt(0).toUpperCase() + item.tier.slice(1)} Plan
                      </p>
                      <p className="text-sm text-slate-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₦{item.amount.toLocaleString()}</p>
                    <Badge
                      variant={item.status === 'active' ? 'default' : 'secondary'}
                      className="mt-1"
                    >
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}