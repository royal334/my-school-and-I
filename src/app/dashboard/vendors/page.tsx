import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VendorCard from "@/components/vendors/vendor-card";
import VendorFilters from "@/components/vendors/vendor-filter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Store, Plus, Building,Edit } from "lucide-react";
import Link from "next/link";
import {
  getCachedVendors,
  getVendorSearch,
  getCachedVendorCategories,
} from "@/utils/cache";

export const metadata = {
  title: "Vendors Marketplace | CampusHub",
};

interface PageProps {
  searchParams: Promise<{
    category?: string;
    search?: string;
  }>;
}

export default async function VendorsPage({ searchParams }: PageProps) {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: userVendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const listBusinessHref = userVendor
    ? `/dashboard/vendors/${userVendor.id}`
    : "/dashboard/vendors/create";
  const listBusinessLabel = userVendor ? "My Business" : "List Your Business";

  const paramaters = await searchParams;

  // Categories are static reference data - cached for 3 days
  const categories = await getCachedVendorCategories();

  // Feed cached 60s; searches run fresh with the authenticated client (RLS)
  const vendors = paramaters.search
    ? await getVendorSearch({
        category: paramaters.category,
        search: paramaters.search,
      })
    : await getCachedVendors({
        category: paramaters.category,
        search: paramaters.search,
      });

  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-display)" }}>Vendors marketplace</h1>
          <p className="text-[#6B7B75] dark:text-[#9BA19E]">
            Connect with verified departmental service providers
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 rounded-lg bg-[#E8F5EF] dark:bg-[#1E211F] px-4 py-2 border border-[#D6E5DF] dark:border-white/10">
            <Store className="h-5 w-5 text-[#4A8C73] dark:text-[#E8F5EF]" />
            <span className="text-sm font-medium text-[#1A3C34] dark:text-[#E8F5EF]">
              {vendors?.length || 0} vendors
            </span>
          </div>
          <Link href={listBusinessHref}>
            <Button className="bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
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
        <Card className="flex flex-col items-center justify-center p-12 text-center border-[#D6E5DF]">
          <div className="rounded-full bg-[#E8F5EF] dark:bg-[#1E211F] p-4">
            <Store className="h-8 w-8 text-[#4A8C73]" />
          </div>
          <h3 className="mt-4 text-lg" style={{ fontFamily: "var(--font-display)" }}>No vendors found</h3>
          <p className="mt-2 text-sm text-[#6B7B75] dark:text-[#9BA19E]">
            Try adjusting your filters or be the first to list your business
          </p>
          <Link href={listBusinessHref}>
            <Button className="mt-4 bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
              {userVendor ? <Edit className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {listBusinessLabel}
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" data-tour="page-vendors">
          {vendors.map((vendor) => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      )}
    </div>
  );
}
