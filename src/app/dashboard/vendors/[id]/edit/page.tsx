import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import VendorForm from '@/components/vendors/vendor-form';
import VendorMediaEditor from '@/components/vendors/vendor-media-editor';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const metadata = {
  title: 'Edit Vendor Listing | EngiPortal',
  description: 'Update your business information',
};

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditVendorPage({ params }: PageProps) {
  const supabase = createClient(await cookies());
  const { id } = await params;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) redirect('/login');

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
  if (vendor.owner_id !== session.user.id) {
    redirect('/dashboard/vendors');
  }

  // Get categories
  const { data: categories } = await supabase
    .from('vendor_categories')
    .select('*')
    .order('display_order');

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Back Button */}
      <Link href={`/dashboard/vendors/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendor
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Edit Vendor Listing</h1>
        <p className="mt-2 text-slate-600">
          Update your business information and media
        </p>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Business Details</TabsTrigger>
          <TabsTrigger value="media">Photos & Media</TabsTrigger>
        </TabsList>

        {/* Business Details Tab */}
        <TabsContent value="details" className="space-y-6">
          <VendorForm
            categories={categories || []}
            mode="edit"
            initialData={{
              id: vendor.id,
              business_name: vendor.business_name,
              category_id: vendor.category_id,
              description: vendor.description,
              services: vendor.services,
              phone_number: vendor.phone_number,
              whatsapp_number: vendor.whatsapp_number || '',
              location: vendor.location || '',
              operating_hours: vendor.operating_hours || '',
            }}
          />
        </TabsContent>

        {/* Photos & Media Tab */}
        <TabsContent value="media" className="space-y-6">
          <VendorMediaEditor vendor={vendor} />
        </TabsContent>
      </Tabs>
    </div>
  );
}