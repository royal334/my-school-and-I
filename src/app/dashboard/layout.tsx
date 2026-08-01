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
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardToggle  from '@/components/dashboard/dashboard-toggle';
import { Settings, User } from "lucide-react"
import Link from "next/link"

export default async function Layout({ children }: { children: React.ReactNode }) {

      const supabase = createClient(await cookies());
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      redirect('/login');
    }

      // Get user profile to determine account type
      const { data: profile } = await supabase
      .from('profiles')
      .select('account_type, full_name, matric_number')
      .eq('id', user.id)
      .single();

    const { data: vendor } = await supabase
    .from('vendors')
    .select('id, subscription_tier, is_approved')
    .eq('owner_id', user.id)
    .single();

      // Read toggle state from cookie
      const cookieStore = await cookies();
      const isStudentToggle = cookieStore.get('isStudent')?.value !== 'false';

      // Determine which sidebar to show
      const isVendorAccount = profile?.account_type === 'vendor';
      const hasVendor = !!vendor && vendor.is_approved;
      const { data: adminRole } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      const isSuperAdmin = adminRole?.role === 'super_admin';
      
      // Switch to vendor sidebar if:
      // 1. User is purely a vendor account type
      // OR 
      // 2. User has an approved vendor listing AND has toggled off student mode
      const showVendorSidebar = isVendorAccount || (hasVendor && !isStudentToggle);
    
  return (
    <>
      {/* Desktop Sidebar Layout */}
      <div className="hidden md:block">
        <SidebarProvider>
          {showVendorSidebar ? 
          (<VendorSidebar userName={profile?.full_name || 'User'}/>) :
          (<AppSidebar />)
          }
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4">
              <div className="flex gap-4 items-center">
                <SidebarTrigger className="-ml-1" />
                <DashboardToggle
                  hasVendor={hasVendor}
                  isVendorAccount={isVendorAccount}
                />
              </div>
              <div>
                <Link href="/dashboard/settings">
                  <Settings className="h-4.5 w-4.5" />
                </Link>
              </div>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 pt-0">
              {children}
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile top header with toggle */}
        <header className="fixed top-0 left-0 right-0 h-16 border-b bg-white dark:bg-slate-950 dark:border-slate-800 z-40 flex items-center px-4 gap-2">
              <div className="flex justify-between items-center w-full">
                <DashboardToggle
                  hasVendor={hasVendor}
                  isVendorAccount={isVendorAccount}
                />
                <div className="flex gap-4 items-center">
                  <Link href="/dashboard/profile">
                    <User className="h-4.5 w-4.5" />
                  </Link>
                  <Link href="/dashboard/settings">
                    <Settings className="h-4.5 w-4.5" />
                  </Link>
                </div>
              </div>
                
              
        </header>

        {/* Mobile content area with proper spacing */}
        <div className="flex-1 overflow-y-auto pt-16 pb-20 px-4">
          {children}
        </div>

        {/* Mobile bottom navigation */}
        {showVendorSidebar ? (
          <VendorMobileBottomNav />
        ) : (
          <MobileBottomNav isSuperAdmin={isSuperAdmin} />
        )}
      </div>
    </>
  );
}
