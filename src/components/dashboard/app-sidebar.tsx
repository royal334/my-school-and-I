"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  BookOpen,
  LayoutDashboard,
  Upload,
  LogOut,
  Calculator,
  User,
  MessageSquare,
  Bell,
  Settings,
  Store,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { createClient } from "@/utils/supabase/client";

const baseNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/materials", icon: BookOpen, label: "Materials library" },
  { href: "/dashboard/cgpa", icon: Calculator, label: "CGPA" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/vendors", icon: Store, label: "Vendors" },
  { href: "/dashboard/notifications", icon: MessageSquare, label: "Notifications" },
  { href: "/dashboard/announcements", icon: Bell, label: "Announcements" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  const closeSidebarOnMobile = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  useEffect(() => {
    async function checkRole() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("admin_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (data && data.role === "super_admin") {
          setIsSuperAdmin(true);
        }
      }
    }
    checkRole();
  }, []);

  const navItems = isSuperAdmin
    ? [
        baseNavItems[0],
        baseNavItems[1],
        {
          href: "/dashboard/materials/upload",
          icon: Upload,
          label: "Upload material",
        },
        ...baseNavItems.slice(2),
      ]
    : baseNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await axios.post("/api/auth/logout");
      if (res.status === 200) {
        router.push("/");
      }
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="px-5 py-5 border-b border-[rgba(126,200,160,0.15)] dark:border-white/10 bg-[#1A3C34] dark:bg-[#0B0D0C]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#E8A020] text-[#3A2800] font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
              CH
            </div>
            <h2 className="text-lg text-[#E8F5EF]" style={{ fontFamily: "var(--font-display)" }}>
              CampusHub
            </h2>
          </div>
        </SidebarHeader>

        <SidebarContent className="bg-[#1A3C34] dark:bg-[#0B0D0C] px-3 py-4">
          <SidebarGroup>
            <SidebarMenu className="space-y-1">
              {navItems.map(({ href, icon: Icon, label }) => {
                const active = isActive(href);
                return (
                  <SidebarMenuItem key={href}>
                    <SidebarMenuButton
                      asChild
                      onClick={closeSidebarOnMobile}
                      isActive={active}
                      className={`relative h-10 px-3 rounded-lg transition-all duration-150 ${
                        active
                          ? "bg-[rgba(126,200,160,0.25)] text-[#E8F5EF] font-medium"
                          : "text-[rgba(232,245,239,0.7)] hover:bg-[rgba(126,200,160,0.12)] hover:text-[#E8F5EF]"
                      }`}
                    >
                      <Link href={href}>
                        {active && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-full bg-[#E8A020]" />
                        )}
                        <Icon className={`h-[18px] w-[18px] ${active ? "text-[#E8A020]" : ""}`} />
                        <span className="ml-1">{label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="px-3 py-4 border-t border-[rgba(126,200,160,0.15)] dark:border-white/10 bg-[#1A3C34] dark:bg-[#0B0D0C]">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowLogoutDialog(true)}
                className="w-full cursor-pointer h-10 px-3 rounded-lg text-[rgba(196,75,42,0.85)] hover:bg-[rgba(196,75,42,0.1)] hover:text-[#C44B2A] transition-all duration-150"
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
              className="bg-[#C44B2A] hover:bg-[#A83D22] text-white"
            >
              {loggingOut ? "Logging out..." : "Yes, log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
