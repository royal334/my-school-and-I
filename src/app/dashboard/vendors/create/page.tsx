import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CreateVendorClient from "@/components/vendors/create-vendor-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Create Vendor Listing | UniHub",
};

export default async function CreateVendorPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Check if user already has a vendor listing
  const { data: existingVendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("owner_id", user.id)
    .single();

  if (existingVendor) {
    // Redirect to their vendor page
    redirect(`/dashboard/vendors/${existingVendor.id}`);
  }

  // Get categories using admin client to bypass RLS
  const { data: categories } = await createAdminClient()
    .from("vendor_categories")
    .select("id, name")
    .order("name");

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <Link href="/dashboard/vendors">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Vendors
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold">List Your Business</h1>
        <p className="text-slate-600">
          Create a vendor listing to connect with students
        </p>
      </div>

      <CreateVendorClient categories={categories || []} />
    </div>
  );
}
