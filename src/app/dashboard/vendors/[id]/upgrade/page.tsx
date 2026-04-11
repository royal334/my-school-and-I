import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import UpgradeForm from '@/components/vendors/upgrade-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Upgrade Subscription | EngiPortal',
  description: 'Upgrade your vendor subscription',
};

interface PageProps {
  params: {
    id: string;
  };
  searchParams: {
    tier?: string;
  };
}

export default async function UpgradePage({ params, searchParams }: PageProps) {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { id } = await params
  const { tier } = await searchParams

  // Get vendor
  const { data: vendor, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !vendor) {
    notFound();
  }

  // Check ownership
  if (vendor.owner_id !== user.id) {
    redirect('/dashboard/vendors');
  }

  const preSelectedTier = tier as 'premium' | 'featured' | undefined;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      {/* Back Button */}
      <Link href={`/dashboard/vendors/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendor
        </Button>
      </Link>

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold">Upgrade Your Subscription</h1>
        <p className="mt-2 text-slate-600">
          Get more visibility and features for your business
        </p>
      </div>

      {/* Current Plan */}
      {vendor.subscription_tier !== 'basic' && (
        <div className="rounded-lg bg-blue-50 p-4 text-center">
          <p className="text-sm font-medium text-blue-900">
            Current Plan: <span className="uppercase">{vendor.subscription_tier}</span>
          </p>
          {vendor.subscription_expires_at && (
            <p className="text-xs text-blue-700">
              Expires: {new Date(vendor.subscription_expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Upgrade Form */}
      <UpgradeForm
        vendor={vendor}
        preSelectedTier={preSelectedTier}
      />
    </div>
  );
}