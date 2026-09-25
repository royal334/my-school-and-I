'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  Bell,
  Upload,
  MessageSquare,
  Store,
  House,
  Calculator
} from 'lucide-react';

import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  isSuperAdmin?: boolean;
}

export function MobileBottomNav({ isSuperAdmin = false }: MobileBottomNavProps) {
  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/materials', icon: BookOpen, label: 'Materials' },
    { href: '/dashboard/cgpa', icon: Calculator, label: 'CGPA' },
    ...(isSuperAdmin
      ? [{ href: '/dashboard/materials/upload', icon: Upload, label: 'Upload' }]
      : []),
    {href:"/dashboard/accommodation", icon: House, label: "Accommodation"},
    { href: '/dashboard/vendors', icon: Store, label: 'Vendors' },
    { href: '/dashboard/notifications', icon: MessageSquare, label: 'Notifications' },
    { href: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
  ];
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard' || pathname === '/dashboard/';
    }

    if (href === '/dashboard/materials') {
      return (
        pathname === '/dashboard/materials' ||
        pathname === '/dashboard/materials/' ||
        (pathname.startsWith('/dashboard/materials/') &&
          !pathname.startsWith('/dashboard/materials/upload'))
      );
    }

    if (href === '/dashboard/materials/upload') {
      return (
        pathname === '/dashboard/materials/upload' ||
        pathname.startsWith('/dashboard/materials/upload/')
      );
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      <nav data-tour="mobile-nav" className="fixed bottom-0 left-0 right-0 border-t border-[#D6E5DF] dark:border-white/10 bg-white dark:bg-[#171918] z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-between gap-1 h-16 sm:h-18 max-w-screen-xl mx-auto px-1.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center h-full px-1 py-1.5 gap-0.5 text-[10px] leading-none rounded-md transition-colors duration-200 overflow-hidden',
                isActive(href)
                  ? 'text-[#1A3C34] dark:text-[#7EC8A0] bg-[#E8F5EF] dark:bg-[#1E211F]'
                  : 'text-[#6B7B75] dark:text-[#9BA19E] hover:text-[#141F1B] dark:hover:text-[#E8F5EF]'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate text-center max-w-full">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="h-16 sm:h-18 md:h-0" />
    </>
  );
}
