import Link from 'next/link';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import VendorCard from '@/components/vendors/vendor-card';
import VendorFilters from '@/components/vendors/vendor-filter';
import { Store, Plus, Edit } from 'lucide-react';
import {
  getCachedVendors,
  getVendorSearch,
  getCachedVendorCategories,
} from '@/utils/cache';

type VendorSearchParams = {
  category?: string | string[];
  search?: string | string[];
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export async function VendorDirectory({
  userId,
  searchParams,
  filterPath = '/dashboard/vendors',
}: {
  userId: string;
  searchParams: VendorSearchParams;
  filterPath?: string;
}) {
  const supabase = createClient(await cookies());
  const { data: userVendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('owner_id', userId)
    .maybeSingle();

  const listBusinessHref = userVendor
    ? `/dashboard/vendors/${userVendor.id}`
    : '/dashboard/vendors/create';
  const listBusinessLabel = userVendor ? 'My Business' : 'List Your Business';
  const category = first(searchParams.category);
  const search = first(searchParams.search);

  const categories = await getCachedVendorCategories();
  const vendors = search
    ? await getVendorSearch({ category, search })
    : await getCachedVendors({ category, search });

  return (
    <div className="space-y-6 overflow-x-hidden">
      <div
        className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center"
        data-tour="page-vendors"
      >
        <div>
          <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)' }}>
            Vendors marketplace
          </h1>
          <p className="text-muted-foreground">
            Connect with verified departmental service providers
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-primary-50 px-4 py-2 dark:border-border dark:bg-primary-950/40">
            <Store className="h-5 w-5 text-primary-600 dark:text-primary-300" />
            <span className="text-sm font-medium text-foreground">
              {vendors?.length || 0} vendors
            </span>
          </div>
          <Link href={listBusinessHref}>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              {userVendor ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {listBusinessLabel}
            </Button>
          </Link>
        </div>
      </div>

      <VendorFilters categories={categories || []} filterPath={filterPath} />

      {!vendors || vendors.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-border p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Store className="h-8 w-8 text-primary-600 dark:text-primary-400" />
          </div>
          <h3 className="mt-4 text-lg" style={{ fontFamily: 'var(--font-display)' }}>
            No vendors found
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try adjusting your filters or be the first to list your business
          </p>
          <Link href={listBusinessHref}>
            <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
              {userVendor ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {listBusinessLabel}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map(vendor => <VendorCard key={vendor.id} vendor={vendor} />)}
        </div>
      )}
    </div>
  );
}
