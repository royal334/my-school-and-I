import VendorSidebar from "@/components/vendors/vendor-sidebar";
import { VendorMobileBottomNav } from "@/components/vendors/vendor-mobile-bottom-nav";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { MobileBottomNav } from "@/components/dashboard/mobile-bottom-nav";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardToggle from "@/components/dashboard/dashboard-toggle";
import { MobileHeaderMenu } from "@/components/dashboard/mobile-header-menu";
import { OnboardingTour } from "@/components/tour/onboarding-tour";
import { TourHelpButton } from "@/components/tour/tour-help-button";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("account_type, full_name, matric_number")
    .eq("id", user.id)
    .single();

  if (profile?.account_type === "agent") {
    redirect("/agent");
  }

  const { data: vendor, error: vendorError } = await createAdminClient()
    .from("vendors")
    .select("id, subscription_tier, is_approved")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (vendorError) {
    throw new Error("Failed to load vendor account details", {
      cause: vendorError,
    });
  }

  const cookieStore = await cookies();
  const isStudentToggle = cookieStore.get("isStudent")?.value !== "false";
  const isVendorAccount = profile?.account_type === "vendor";
  const hasVendor = !!vendor && vendor.is_approved;
  const { data: adminRole } = await supabase
    .from("admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  const showVendorSidebar = isVendorAccount || (hasVendor && !isStudentToggle);

  return (
    <>
      <div className="hidden min-h-screen md:block">
        <SidebarProvider>
          {showVendorSidebar ? (
            <VendorSidebar userName={profile?.full_name || "User"} />
          ) : (
            <AppSidebar />
          )}
          <SidebarInset className="bg-background">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl">
              <SidebarTrigger className="-ml-1" />
              <DashboardToggle 
                hasVendor={hasVendor} 
                isVendorAccount={isVendorAccount}
                isAdmin={Boolean(adminRole)}
              />
                <TourHelpButton
                hasVendor={hasVendor}
                isVendorAccount={isVendorAccount}
                className="ml-auto size-8"
              />
            </header>
            <div className="flex flex-1 flex-col gap-5 overflow-x-hidden p-4 pt-0 sm:p-6 sm:pt-2">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile top header with toggle */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b border-white/10 bg-primary-950 z-40 flex items-center px-4 gap-2">
          <DashboardToggle 
            hasVendor={hasVendor} 
            isVendorAccount={isVendorAccount}
            isAdmin={Boolean(adminRole)}
          />
          <MobileHeaderMenu hasVendor={hasVendor} isVendorAccount={isVendorAccount} />
        </header>

        <main className="flex-1 overflow-y-auto bg-background px-4 pb-20 pt-20">
          {children}
        </main>

        {showVendorSidebar ? <VendorMobileBottomNav /> : <MobileBottomNav />}
      </div>

      <OnboardingTour
        isVendorView={showVendorSidebar}
        hasToggle={hasVendor && !isVendorAccount}
        userId={user.id}
      />
    </>
  );
}
