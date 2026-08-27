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
import { VendorMobileBottomNav } from "@/components/vendors/vendor-mobile-bottom-nav";
import {LayoutDashboard, BarChart3, Crown, MessageSquare, Settings, LogOut} from 'lucide-react';

const vendorNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Analytics",
    href: "/dashboard/vendors/analytics",
    icon: BarChart3,
  },
  {
    name: "Subscription",
    href: "/dashboard/subscription",
    icon: Crown,
  },
  {
    name:"Notification",
    href:"/dashboard/notifications",
    icon:MessageSquare,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
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
      const res = await axios.post("/api/auth/logout");
      if (res.status === 200) {
        router.push("/");
      }
    } catch {
      router.push("/");
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <div className="hidden md:block" data-tour ="vendor-sidebar">
        <Sidebar>
          <SidebarHeader className="border-b border-[rgba(126,200,160,0.15)] px-5 py-5 bg-[#1A3C34] dark:bg-[#091210]">
            <Link href="/dashboard" onClick={closeSidebarOnMobile}>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8A020] text-[#3A2800] font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  CH
                </div>
                <div>
                  <h1 className="text-lg text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
                    CampusHub
                  </h1>
                  <p className="text-xs text-[rgba(232,245,239,0.5)]">Vendor dashboard</p>
                </div>
              </div>
            </Link>
          </SidebarHeader>

          <SidebarContent className="bg-[#1A3C34] dark:bg-[#091210] px-3 py-4">
            <SidebarGroup>
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
                        className={`relative h-10 px-3 rounded-lg transition-all duration-150 ${
                          active
                            ? "bg-[rgba(126,200,160,0.25)] text-[#E8F5EF] font-medium"
                            : "text-[rgba(232,245,239,0.7)] hover:bg-[rgba(126,200,160,0.12)] hover:text-[#E8F5EF]"
                        }`}
                      >
                        <Link href={item.href}>
                          {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#E8A020]" />
                          )}
                          <Icon className={`h-[18px] w-[18px] ${active ? "text-[#E8A020]" : ""}`} />
                          <span className="ml-1">{item.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="px-3 py-4 border-t border-[rgba(126,200,160,0.15)] bg-[#1A3C34] dark:bg-[#091210]">
            <div className="mb-3 rounded-lg bg-[rgba(126,200,160,0.12)] p-3 border border-[rgba(126,200,160,0.1)]">
              <p className="truncate text-sm font-medium text-[#E8F5EF]">{userName}</p>
              <p className="text-xs text-[rgba(232,245,239,0.5)]">Vendor account</p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setShowLogoutDialog(true)}
                  className="w-full cursor-pointer h-10 px-3 rounded-lg text-[rgba(196,75,42,0.85)] hover:bg-[rgba(196,75,42,0.1)] hover:text-[#C44B2A] transition-all duration-150"
                >
                  <LogOut className="h-[18px] w-[18px]" />
                  <span className="ml-1">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
      </div>

      <div className="md:hidden">
        <VendorMobileBottomNav />
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
              className="bg-[#C44B2A] hover:bg-[#A83D22] text-white"
            >
              {loggingOut ? "Signing out…" : "Yes, sign out"}
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
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-[#D6E5DF] px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        <div className="flex flex-1 flex-col gap-4 overflow-x-hidden p-4 pt-0">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
