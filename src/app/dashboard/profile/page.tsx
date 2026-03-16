import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import SubscriptionCard from '@/components/profile/subscription-card';
import SecurityCard from '@/components/profile/security-card';
import { ArrowLeft, User } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata = {
  title: 'Profile & Settings | EngiPortal',
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
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-slate-600">
          Manage your account information and preferences
        </p>
      </div>

      {/* Role Badge (if admin) */}
      {adminRole && (
        <Card className="border-primary-200 bg-primary-50">
          <CardContent className="flex items-center gap-3 py-4">
            <div className="rounded-full bg-primary-100 p-2">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-primary-900">
                {adminRole.role.replace('_', ' ').toUpperCase()}
              </p>
              <p className="text-sm text-primary-700">
                You have administrative access to this platform
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Form */}
      <ProfileForm 
        profile={profile} 
        email={user.email!}
        userId={user.id}
      />

      {/* Subscription Status */}
      <SubscriptionCard profile={profile} />

      {/* Security Settings */}
      <SecurityCard email={user.email!} />
    </div>
  );
}