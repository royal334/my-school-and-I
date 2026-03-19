"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
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
  Users,
  Bell,
  Settings,
} from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { createClient } from "@/utils/supabase/client";

const baseNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/materials", icon: BookOpen, label: "Materials Library" },
  { href: "/dashboard/cgpa", icon: Calculator, label: "CGPA" },
  { href: "/dashboard/profile", icon: User, label: "Profile" },
  { href: "/dashboard/vendors", icon: Users, label: "Vendors" },
  { href: "/dashboard/announcements", icon: Bell, label: "Announcements" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function AppSidebar() {
  const router = useRouter();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

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
          .single();

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
          label: "Upload Material",
        },
        ...baseNavItems.slice(2),
      ]
    : baseNavItems;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await axios.post("/api/auth/logout");
      if (res.status === 200) {
        router.push("/");
      }
    } catch {
      // If the fetch itself throws (e.g. network error) still redirect
      router.push("/login");
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  return (
    <>
      <Sidebar>
        <SidebarHeader className="p-4 border-b dark:border-slate-800 bg-white dark:bg-slate-950">
          <h2 className="text-xl font-bold text-blue-600 dark:text-blue-500">
            EngiPortal
          </h2>
        </SidebarHeader>

        <SidebarContent className="bg-white dark:bg-slate-950">
          <SidebarGroup>
            <SidebarMenu className="space-y-4">
              {navItems.map(({ href, icon: Icon, label }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild>
                    <Link href={href}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t dark:border-slate-800 bg-white dark:bg-slate-950">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowLogoutDialog(true)}
                className="w-full cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/50 dark:hover:text-red-300"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      {/* Logout confirmation dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of EngiPortal?</AlertDialogTitle>
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
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 dark:bg-red-700 dark:hover:bg-red-800"
            >
              {loggingOut ? "Logging out…" : "Yes, log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
