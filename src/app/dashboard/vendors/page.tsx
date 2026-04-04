import { createClient } from "@/utils/supabase/server";
//import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VendorCard from "@/components/vendors/vendor-card";
import VendorFilters from "@/components/vendors/vendor-filter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Plus, Building,Edit } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Vendors Marketplace | EngiPortal",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) redirect("/login");

  const { data: userVendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", session.user.id)
    .maybeSingle();

  const listBusinessHref = userVendor
    ? `/dashboard/vendors/${userVendor.id}`
    : "/dashboard/vendors/create";
  const listBusinessLabel = userVendor ? "My Business" : "List Your Business";

  const paramaters = await searchParams;

  //const admin = createAdminClient();

  // Get categories (admin client bypasses RLS)
  const { data: categories } = await supabase
    .from("vendor_categories")
    .select("id, name, icon")
    .order("name");

  // Build query (admin client bypasses RLS)
  let query = supabase
    .from("vendors")
    .select(
      `
      *,
      vendor_categories (
        name,
        icon
      ),
      profiles (
        full_name
      )
    `,
    )
    .eq("is_approved", true);

  // Apply filters
  if (paramaters.category && paramaters.category !== "all") {
    query = query.eq("category_id", paramaters.category);
  }

  if (paramaters.search) {
    query = query.or(
      `business_name.ilike.%${paramaters.search}%,` +
        `description.ilike.%${paramaters.search}%`,
    );
  }

  // Sort: Featured first, then by rating
  query = query
    .order("is_featured", { ascending: false })
    .order("rating_avg", { ascending: false })
    .order("created_at", { ascending: false });

  const { data: vendors } = await query;

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">Vendors Marketplace</h1>
          <p className="text-slate-600">
            Connect with verified departmental service providers
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-4 py-2">
            <Store className="h-5 w-5 text-primary-600" />
            <span className="text-sm font-medium text-primary-900">
              {vendors?.length || 0} vendors
            </span>
          </div>
          <Link href={listBusinessHref}>
            <Button>
              {userVendor ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {listBusinessLabel}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <VendorFilters categories={categories || []} />

      {/* Vendors Grid */}
      {!vendors || vendors.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="rounded-full bg-slate-100 p-4">
            <Store className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="mt-2 text-sm text-slate-600">
            Try adjusting your filters or be the first to list your business
          </p>
          <Link href={listBusinessHref}>
            <Button className="mt-4">
              {userVendor ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {listBusinessLabel}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
