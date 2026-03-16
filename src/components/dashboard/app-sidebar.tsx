"use client";

import { useState } from "react";
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
import axios from "axios"

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/materials", icon: BookOpen, label: "Materials Library" },
  {
    href: "/dashboard/materials/upload",
    icon: Upload,
    label: "Upload Material",
  },
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

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await axios.post("/api/auth/logout");
      if (res.status === 200) {
        router.push("/login");
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
        <SidebarHeader className="p-4 border-b bg-white">
          <h2 className="text-xl font-bold text-blue-600">EngiPortal</h2>
        </SidebarHeader>

        <SidebarContent className="bg-white">
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

        <SidebarFooter className="p-4 border-t bg-white">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setShowLogoutDialog(true)}
                className="w-full cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700"
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
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {loggingOut ? "Logging out…" : "Yes, log out"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
