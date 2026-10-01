"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  Bell,
  BookOpen,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Settings,
  Store,
  User,
  House,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { CampusHubLogo } from "@/components/brand/logo";

const baseNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/materials", icon: BookOpen, label: "Materials library" },
  {href:"/dashboard/accommodation", icon: House, label: "Accommodation"},
  { href: "/dashboard/market", icon: Store, label: "Market" },
  { href: "/dashboard/notifications", icon: MessageSquare, label: "Notifications" },
  { href: "/dashboard/announcements", icon: Bell, label: "Announcements" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === '/dashboard/market') {
      return ['/dashboard/market', '/dashboard/vendors', '/dashboard/marketplace'].some(
        base => pathname === base || pathname.startsWith(`${base}/`),
      );
    }
    return pathname.startsWith(href);
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
      <Sidebar className="border-r border-primary-800/20 bg-sidebar">
        <SidebarHeader className="border-b border-sidebar-border bg-sidebar px-5 py-5">
          <CampusHubLogo inverted markClassName="size-9" />
        </SidebarHeader>

        <SidebarContent className="bg-sidebar px-3 py-4">
          <SidebarGroup>
            <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/45">
              Your hub
            </p>
            <SidebarMenu className="space-y-1">
              {baseNavItems.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);

                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      onClick={closeSidebarOnMobile}
                      isActive={active}
                      className={`relative h-10 rounded-lg px-3 transition-all duration-150 ${
                        active
                          ? "bg-sidebar-accent text-accent-500 dark:text-accent-500"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-accent-300"
                      }`}
                    >
                      <Link href={href}>
                        {active && (
                          <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent-500" />
                        )}
                        <Icon
                          className={`h-[18px] w-[18px] ${
                            active ? "text-accent-400" : ""
                          }`}
                        />
                        <span className="ml-1">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border bg-sidebar px-3 py-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowLogoutDialog(true)}
                className="h-10 w-full cursor-pointer rounded-lg px-3 text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-[18px] w-[18px]" />
                <span className="ml-1">Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of CampusHub?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be signed out of your account and redirected to the login
              page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              disabled={loggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loggingOut ? "Logging out..." : "Yes, log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
