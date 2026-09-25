import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isUserAdmin } from '@/utils/supabase/queries';
import { getLeadDetail } from '@/utils/supabase/queries/accommodation-admin';
import { LeadDetailView } from '@/components/admin/accommodation/lead-detail';

export const metadata = {
  title: 'Admin · Lead details',
};

export default async function AdminLeadDetailPage({
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

  const lead = await getLeadDetail(supabase, id);
  if (!lead) notFound();

  return <LeadDetailView lead={lead} />;
}