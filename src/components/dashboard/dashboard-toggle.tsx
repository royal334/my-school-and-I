'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Store } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardToggleProps {
  hasVendor: boolean;
  isVendorAccount: boolean;
  isAdmin?: boolean;
}

export default function DashboardToggle({
  hasVendor,
  isVendorAccount,
  isAdmin = false,
}: DashboardToggleProps) {
  const [isStudent, setIsStudent] = useState(true);
  const router = useRouter();

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
    document.cookie = `isStudent=${!toVendor}; path=/; max-age=${60 * 60 * 72}`;
    setIsStudent(!toVendor);
    router.push('/dashboard');
    router.refresh();
  };

  const handleAdminToggle = () => {
    router.push('/admin/accommodation');
    router.refresh();
  };

  if (isVendorAccount || (!hasVendor && !isAdmin)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#D6E5DF] dark:border-white/10 bg-[#F0F5F3] dark:bg-[#1E211F] p-1" data-tour="dashboard-toggle">
      {!isVendorAccount && (
        <>
          <Button
            variant={!isStudent ? 'ghost' : 'default'}
            size="sm"
            onClick={() => handleToggle(false)}
            className={cn(
              'flex items-center gap-2',
              isStudent && 'bg-[#1A3C34] dark:bg-[#4A8C73] shadow-sm text-[#E8F5EF]'
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
              !isStudent && 'bg-[#1A3C34] dark:bg-[#4A8C73] shadow-sm text-[#E8F5EF]'
            )}
          >
            <Store className="h-4 w-4" />
            Vendor
          </Button>
        </>
      )}

      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdminToggle}
          className="flex items-center gap-2 border-[#1A3C34] text-[#1A3C34] dark:border-[#4A8C73] dark:text-[#E8F5EF]"
        >
          <Shield className="h-4 w-4" />
          Admin
        </Button>
      )}
    </div>
  );
}
