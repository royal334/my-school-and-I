// app/dashboard/vendors/analytics/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AnalyticsDashboard from '@/components/vendors/analytics-dashboard'

export const metadata = {
  title: 'Analytics | EngiPortal',
  description: 'View your vendor analytics',
};

export default async function VendorAnalyticsPage() {
  const supabase = createClient(await cookies());

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get vendor owned by user
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!vendor) {
    redirect('/dashboard/vendors/create');
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-slate-600">
          Track your vendor's performance and insights
        </p>
      </div>

      {/* Analytics Dashboard */}
      <AnalyticsDashboard vendorId={vendor.id} tier={vendor.subscription_tier} />
    </div>
  );
}