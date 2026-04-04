// app/dashboard/vendors/[id]/edit/page.tsx
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import VendorForm from '@/components/vendors/vendor-form';

export default async function EditVendorPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient(await cookies());

  // Get user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Get vendor
  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!vendor) {
    redirect('/dashboard/vendors');
  }

  // Check ownership
  if (vendor.owner_id !== user.id) {
    redirect('/dashboard/vendors');
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Edit Vendor Listing</h1>
      <VendorForm initialData={vendor} mode="edit" />
    </div>
  );
}