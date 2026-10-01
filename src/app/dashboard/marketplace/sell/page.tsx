import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getOwnedListingDraft, getSellerSlots } from '@/utils/supabase/queries/marketplace';
import { MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import { SellWizard } from '@/components/marketplace/sell/sell-wizard';

export const metadata = {
  title: 'Sell something | Marketplace | Campus&Me',
  description: 'List an item for sale on the campus marketplace',
};

interface PageProps {
  searchParams: Promise<{ edit?: string | string[] }>;
}

export default async function SellPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { edit } = await searchParams;
  const editId = (Array.isArray(edit) ? edit[0] : edit) || null;

  const [slots, existing] = await Promise.all([
    getSellerSlots(supabase, user.id),
    editId ? getOwnedListingDraft(supabase, user.id, editId) : Promise.resolve(null),
  ]);

  if (editId && !existing) redirect(`${MARKETPLACE_BASE_PATH}/my-listings`);
  if (editId && existing && existing.status !== 'active') {
    redirect(`${MARKETPLACE_BASE_PATH}/${editId}`);
  }

  return (
    <SellWizard
      sellerId={user.id}
      slots={slots}
      initialDraft={existing?.draft ?? null}
      editId={editId}
    />
  );
}
