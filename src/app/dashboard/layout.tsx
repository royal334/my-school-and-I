import VendorSidebar from "@/components/vendors/vendor-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardToggle  from '@/components/dashboard/dashboard-toggle';

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
      
      // Switch to vendor sidebar if:
      // 1. User is purely a vendor account type
      // OR 
      // 2. User has an approved vendor listing AND has toggled off student mode
      const showVendorSidebar = isVendorAccount || (hasVendor && !isStudentToggle);

      //const isVendor = profile?.account_type === 'vendor';

    
  return (
    <SidebarProvider>
      {showVendorSidebar ? 
      (<VendorSidebar userName={profile?.full_name || 'User'}/>) :
      (<AppSidebar />)
      }
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <DashboardToggle 
            hasVendor={hasVendor} 
            isVendorAccount={isVendorAccount} 
          />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
