import { Button } from "@/components/ui/button";
import ExternalVendorForm from "@/components/vendors/external-vendor-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function VendorSignupPage() {
  const supabase = createClient(await cookies());

  // Get categories
  const { data: categories } = await supabase
    .from("vendor_categories")
    .select("id, name")
    .order("name");

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 p-0 hover:bg-transparent"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <ExternalVendorForm
          subtitle="Join UniHub's vendor marketplace and connect with thousands of students"
          showSignInLink
          signInHref="/login"
          categories={categories || []}
        />
      </div>
    </div>
  );
}
