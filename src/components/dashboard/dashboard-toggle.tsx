'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GraduationCap, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardToggleProps {
  hasVendor: boolean;
  isVendorAccount: boolean;
}

export default function DashboardToggle({ 
  hasVendor, 
  isVendorAccount 
}: DashboardToggleProps) {
  // Initialize state from cookie or default to true
  const [isStudent, setIsStudent] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  
  // Determine current view based on path
  //const isVendorView = pathname.includes('/vendors/analytics') || pathname.includes('/subscription') || pathname.includes('/billing');

  // Sync state with cookie on mount
  useEffect(() => {
    const isStudentCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('isStudent='))
      ?.split('=')[1];
    
    if (isStudentCookie !== undefined) {
      setIsStudent(isStudentCookie !== 'false');
    }
  }, []);

  const handleToggle = (toVendor: boolean) => {
    // Set cookie that expires in 3 days (matches user's previous preference)
    document.cookie = `isStudent=${!toVendor}; path=/; max-age=${60 * 60 * 72}`;
    setIsStudent(!toVendor);

    // Always go to dashboard root to show the selected context's main view
    router.push('/dashboard');

    // Refresh the router to update the server-side layout (sidebar and page content)
    router.refresh();
  };

  // Don't show toggle if:
  // 1. User is external vendor (no student features)
  // 2. Student doesn't have a vendor listing
  if (isVendorAccount || !hasVendor) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border bg-slate-50 p-1">
      <Button
        variant={!isStudent ? 'ghost' : 'default'}
        size="sm"
        onClick={() => handleToggle(false)}
        className={cn(
          'flex items-center gap-2',
          isStudent && 'bg-blue-600 shadow-sm text-white'
        )}
      >
        <GraduationCap className="h-4 w-4" />
        Student
      </Button>

      <Button
        variant={isStudent ? 'ghost' : 'default'}
        size="sm"
        onClick={() => handleToggle(true)}
        className={cn(
          'flex items-center gap-2',
          !isStudent && 'bg-blue-600 shadow-sm text-white'
        )}
      >
        <Store className="h-4 w-4" />
        Vendor
      </Button>
    </div>
  );
  }