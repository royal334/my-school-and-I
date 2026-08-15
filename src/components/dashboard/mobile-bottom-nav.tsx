'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useRouter as useRouterNav } from 'next/navigation';
import axios from 'axios';
import {
  BookOpen,
  LayoutDashboard,
  Bell,
  Upload,
  LogOut,
  Store, 
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
    { href: '/dashboard/vendors', icon: Store, label: 'Vendors' },
    { href: '/dashboard/announcements', icon: Bell, label: 'Announcements' },
  ];
  const pathname = usePathname();
  const router = useRouterNav();



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
      <nav data-tour="mobile-nav" className="fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-slate-950 dark:border-slate-800 z-50">
        <div className="flex items-center justify-between gap-1 h-16 sm:h-18 max-w-screen-xl mx-auto px-1.5">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center justify-center h-full px-1 py-1.5 gap-0.5 text-[10px] leading-none rounded-md transition-colors duration-200 overflow-hidden',
                isActive(href)
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-900'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              <span className="truncate text-center max-w-full">{label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Add padding to body to account for fixed bottom nav */}
      <div className="h-16 sm:h-18 md:h-0" />


    </>
  );
}
