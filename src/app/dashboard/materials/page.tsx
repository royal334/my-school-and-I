import { Suspense } from "react";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getMaterials } from "@/utils/supabase/queries";
import MaterialsContent from "@/components/materials/materials-content";
import MaterialsFilters from "@/components/materials/materials-filters";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import UpgradeButton from "@/components/payment/update-button";

export const metadata = {
  title: "Materials Library | UniHub",
  description: "Access lecture notes, past questions, and study materials",
};

interface PageProps {
  searchParams: Promise<{
    level?: string;
    semester?: string;
    type?: string;
    search?: string;
  }>;
}

export default async function MaterialsPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const supabase = createClient(await cookies());

  // Get current user - getUser is more secure and helps with session refresh
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="p-10 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
        Debug: No session found. Please log in.
      </div>
    );
  }

  // Get user profile for subscription status
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  // Parse search params
  const level = resolvedSearchParams.level
    ? parseInt(resolvedSearchParams.level)
    : undefined;
  const semester = resolvedSearchParams.semester
    ? parseInt(resolvedSearchParams.semester)
    : undefined;
  const type =
    resolvedSearchParams.type !== "all" ? resolvedSearchParams.type : undefined;
  const search = resolvedSearchParams.search;

  // Fetch materials using an admin client to bypass RLS, so that locked premium materials
  // are still sent to the UI, where they render as locked cards!
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const materials = await getMaterials({
    level,
    semester,
    type,
    search,
    limit: 50,
    supabase: supabaseAdmin, // use admin client
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Materials Library
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Access lecture notes, past questions, and study materials
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-4 py-2">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              {materials.length} materials available
            </span>
          </div>
        </div>
      </div>

      {/* Subscription Status Banner */}
      {profile && profile.subscription_status !== "active" && (
        <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/30 p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-amber-100 dark:bg-amber-900/50 p-2">
              <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100">
                Limited Access Mode
              </h3>
              <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
                You're viewing free materials only. Subscribe for ₦1000/semester
                to unlock all premium materials.
              </p>
                <UpgradeButton className="mt-2 bg-amber-600 dark:bg-amber-700 hover:bg-amber-700 dark:hover:bg-amber-600 transition-colors" />
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <MaterialsFilters />

      {/* Materials Grid */}
      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        }
      >
        <MaterialsContent materials={materials} profile={profile} />
      </Suspense>
    </div>
  );
}
