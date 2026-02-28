import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation';
import ProfileForm from '@/components/profile/profile-form';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">Profile & Settings</h1>
        <p className="text-slate-600">
          Manage your account information and preferences
        </p>
      </div>

      <ProfileForm profile={profile} email={user.email!} />
    </div>
  );
}