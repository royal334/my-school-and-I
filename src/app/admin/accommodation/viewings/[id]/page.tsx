import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { getViewingDetail } from '@/utils/supabase/queries/accommodation-admin';
import { ViewingDetailView } from '@/components/admin/accommodation/viewing-detail';

export const metadata = {
  title: 'Admin · Viewing details',
};

export default async function AdminViewingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  if (!(await isUserAdmin(user.id, supabase))) redirect('/dashboard');

  const viewing = await getViewingDetail(supabase, id);
  if (!viewing) notFound();

  return <ViewingDetailView viewing={viewing} />;
}