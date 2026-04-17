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

      // Determine which sidebar to show
      const isVendor = profile?.account_type === 'vendor';

    
  return (
    <SidebarProvider>
      {isVendor ? 
      (<VendorSidebar userName={profile.full_name}/>) :
      (<AppSidebar />)}
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
