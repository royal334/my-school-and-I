"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
} from "lucide-react";
import { CampusHubLogo } from "@/components/brand/logo";

const vendorNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Analytics", href: "/dashboard/vendors/analytics", icon: BarChart3 },
  { name: "Subscription", href: "/dashboard/subscription", icon: Crown },
  { name: "Notifications", href: "/dashboard/notifications", icon: MessageSquare },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface VendorSidebarProps {
  userName: string;
}

export default function VendorSidebar({ userName }: VendorSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isMobile, setOpenMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await axios.post("/api/auth/logout");
      router.push(response.status === 200 ? "/" : "/login");
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <div className="hidden md:block" data-tour="vendor-sidebar">
        <Sidebar className="border-r border-primary-800/20 bg-sidebar">
          <SidebarHeader className="border-b border-sidebar-border bg-sidebar px-5 py-5">
            <Link href="/dashboard" onClick={closeSidebarOnMobile}>
              <CampusHubLogo inverted />
              <p className="mt-2 text-xs text-sidebar-foreground/55">Vendor dashboard</p>
            </Link>
          </SidebarHeader>

          <SidebarContent className="bg-sidebar px-3 py-4">
            <SidebarGroup>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
                Business hub
              </p>
              <SidebarMenu className="space-y-1">
                {vendorNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isNavActive(pathname, item.href);

                  return (
                    <SidebarMenuItem key={item.name}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.name}
                        onClick={closeSidebarOnMobile}
                        className={`relative h-10 rounded-lg px-3 transition-all duration-150 ${
                          active
                            ? "bg-sidebar-accent  text-accent-500 dark:text-accent-500"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70  hover:text-accent-300"
                        }`}
                      >
                        <Link href={item.href}>
                          {active && (
                            <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent-500" />
                          )}
                          <Icon
                            className={`h-[18px] w-[18px] ${
                              active ? "text-accent-400" : ""
                            }`}
                          />
                          <span className="ml-1">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border bg-sidebar px-3 py-4">
            <div className="mb-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3">
              <p className="truncate text-sm font-semibold">{userName}</p>
              <p className="text-xs text-sidebar-foreground/55">Vendor account</p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowLogoutDialog(true)}
                  className="h-10 w-full cursor-pointer rounded-lg px-3 text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span className="ml-1">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out of CampusHub?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your vendor account and redirected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loggingOut ? "Signing out..." : "Yes, sign out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function VendorDashboardLayout({
  userName,
  children,
}: {
  userName: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <VendorSidebar userName={userName} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-xl">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-5 overflow-x-hidden p-4 pt-0 sm:p-6 sm:pt-2">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
