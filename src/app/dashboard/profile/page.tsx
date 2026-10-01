import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import { AccommodationPayoutDetailsForm } from '@/components/profile/accommodation-payout-details-form';
//import SubscriptionCard from '@/components/profile/subscription-card';
import SecurityCard from '@/components/profile/security-card';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Profile & Settings | Campus&Me',
};

export default async function ProfilePage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // Get admin role (if any)
  const { data: adminRole } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  const { data: qualifyingReferral, error: referralError } = await createAdminClient()
    .from('accommodation_referrals')
    .select('id')
    .eq('referrer_id', user.id)
    .not('transaction_id', 'is', null)
    .limit(1)
    .maybeSingle();

  if (referralError) throw referralError;

  let payoutDetails = null;
  if (qualifyingReferral) {
    const { data, error } = await supabase
      .from('accommodation_payout_details')
      .select('bank_name, account_name, account_number')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    payoutDetails = data;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>Profile & settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>

      {/* Role Badge (if admin) */}
      {adminRole && (
        <Card className="border-border dark:border-border bg-primary-50 dark:bg-primary-950/40">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-primary p-2">
              <User className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">
                {adminRole.role.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-primary-600 dark:text-primary-400">
                You have administrative access to this platform
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div data-tour="page-profile">
        {/* Profile Form */}
        <ProfileForm
          profile={profile}
          email={user.email!}
          userId={user.id}
        />
        {qualifyingReferral && (
          <div className="mt-6">
            <AccommodationPayoutDetailsForm
              userId={user.id}
              initialValues={payoutDetails}
            />
          </div>
        )}
        {/* Subscription Status */}
        {/* <SubscriptionCard profile={profile} /> */}
        {/* Security Settings */}
        <SecurityCard email={user.email!} />
      </div>
    </div>
  );
}