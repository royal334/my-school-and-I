"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Crown,
  LayoutDashboard,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const vendorNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/vendors/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/subscription", icon: Crown, label: "Plan" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const verificationNavItem = {
  href: "/dashboard/vendors/verification",
  icon: ShieldCheck,
  label: "Verify",
};

export function VendorMobileBottomNav({
  isFeatured = false,
}: {
  isFeatured?: boolean;
}) {
  const pathname = usePathname();

  const navItems = isFeatured
    ? [
        vendorNavItems[0],
        vendorNavItems[1],
        verificationNavItem,
        vendorNavItems[2],
        vendorNavItems[3],
      ]
    : vendorNavItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <nav
        data-tour="mobile-nav"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur-xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex h-16 max-w-screen-xl items-center justify-between gap-1 px-1.5 sm:h-18">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-full min-w-0 flex-1 flex-col items-center justify-center gap-1 overflow-hidden rounded-lg px-1 py-1.5 text-[10px] leading-none transition-colors",
                isActive(href)
                  ? "bg-primary-50 font-semibold text-primary-700 dark:bg-primary-950 dark:text-primary-300"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              <span className="max-w-full truncate text-center">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="h-16 sm:h-18 md:h-0" />
    </>
  );
}
