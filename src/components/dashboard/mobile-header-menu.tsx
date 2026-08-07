'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { MoreVertical, RotateCcw, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTourStore } from '@/components/tour/tour-store';

interface MobileHeaderMenuProps {
  hasVendor: boolean;
  isVendorAccount: boolean;
}

export function MobileHeaderMenu({ hasVendor, isVendorAccount }: MobileHeaderMenuProps) {
  const start = useTourStore((s) => s.start);
  const isVendorViewRef = useRef(false);

  useEffect(() => {
    const isStudent = document.cookie
      .split('; ')
      .find((r) => r.startsWith('isStudent='))
      ?.split('=')[1] !== 'false';
    isVendorViewRef.current = isVendorAccount || (hasVendor && !isStudent);
  }, [hasVendor, isVendorAccount]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto size-8"
          title="Menu"
          aria-label="Open menu"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile">
            <User />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => start(isVendorViewRef.current ? 'vendor' : 'student')}>
          <RotateCcw />
          Replay Tour
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
