'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MoreVertical, RotateCcw, Settings, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import axios from 'axios';
import { useTourStore } from '@/components/tour/tour-store';
import { NotificationBell } from '@/components/notifications/notification-bell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface MobileHeaderMenuProps {
  hasVendor: boolean;
  isVendorAccount: boolean;
}

export function MobileHeaderMenu({ hasVendor, isVendorAccount }: MobileHeaderMenuProps) {
  const start = useTourStore((s) => s.start);
  const isVendorViewRef = useRef(false);
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const res = await axios.post('/api/auth/logout');
      if (res.status === 200) {
        router.push('/');
      }
    } catch {
      router.push('/login');
    } finally {
      setLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  useEffect(() => {
    const isStudent = document.cookie
      .split('; ')
      .find((r) => r.startsWith('isStudent='))
      ?.split('=')[1] !== 'false';
    isVendorViewRef.current = isVendorAccount || (hasVendor && !isStudent);
  }, [hasVendor, isVendorAccount]);

  return (
    <>
      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              title="Menu"
              aria-label="Open menu"
              data-tour="mobile-header-menu"
            >
              <MoreVertical className="h-4 w-4 text-white" />
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
            <DropdownMenuItem
              onSelect={() => {
                window.requestAnimationFrame(() => setShowLogoutDialog(true));
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="text-destructive" />
              <span>Logout</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => start(isVendorViewRef.current ? 'vendor' : 'student', 'manual')}>
              <RotateCcw />
              Replay tour
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of Campus&Me?</AlertDialogTitle>
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
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {loggingOut ? 'Logging out…' : 'Yes, log out'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
