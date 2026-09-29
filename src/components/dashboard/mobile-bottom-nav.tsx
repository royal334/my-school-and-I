"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  Megaphone,
  Store,
  House,
  Upload,
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  isSuperAdmin?: boolean;
}

export function MobileBottomNav({ isSuperAdmin = false }: MobileBottomNavProps) {
  const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/materials", icon: BookOpen, label: "Materials" },
    ...(isSuperAdmin
      ? [{ href: "/dashboard/materials/upload", icon: Upload, label: "Upload" }]
      : []),
    {href:"/dashboard/accommodation", icon: House, label: "Accommodation"},
    { href: '/dashboard/market', icon: Store, label: 'Market' },
    { href: '/dashboard/announcements', icon: Megaphone, label: 'Updates' },
  ];
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard" || pathname === "/dashboard/";
    }

    if (href === "/dashboard/materials") {
      return (
        pathname === "/dashboard/materials" ||
        pathname === "/dashboard/materials/" ||
        (pathname.startsWith("/dashboard/materials/") &&
          !pathname.startsWith("/dashboard/materials/upload"))
      );
    }

    if (href === "/dashboard/materials/upload") {
      return (
        pathname === "/dashboard/materials/upload" ||
        pathname.startsWith("/dashboard/materials/upload/")
      );
    }

    if (href === '/dashboard/market') {
      return ['/dashboard/market', '/dashboard/vendors', '/dashboard/marketplace'].some(
        base => pathname === base || pathname.startsWith(`${base}/`),
      );
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
