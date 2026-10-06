'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { GraduationCap, Shield, Store } from 'lucide-react';
import { cn } from '@/lib/utils';
import { requestPageLoader } from '@/components/providers/page-loader';

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
    requestPageLoader();
    router.push('/admin');
    router.refresh();
  };

  if (isVendorAccount || (!hasVendor && !isAdmin)) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-1" data-tour="dashboard-toggle">
      {!isVendorAccount && (
        <>
          <Button
            variant={!isStudent ? 'ghost' : 'default'}
            size="sm"
            onClick={() => handleToggle(false)}
            className={cn(
              'flex items-center gap-2',
              isStudent && 'bg-primary text-primary-foreground shadow-sm'
            )}
          >
            <GraduationCap className="h-4 w-4" />
            Student
          </Button>

          {hasVendor && (
            <Button
              variant={isStudent ? 'ghost' : 'default'}
              size="sm"
              onClick={() => handleToggle(true)}
              className={cn(
                'flex items-center gap-2',
                !isStudent && 'bg-primary text-primary-foreground shadow-sm'
              )}
            >
              <Store className="h-4 w-4" />
              Vendor
            </Button>
          )}
        </>
      )}

      {isAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleAdminToggle}
          className="flex items-center gap-2 border-primary text-primary dark:text-primary-300"
        >
          <Shield className="h-4 w-4" />
          Admin
        </Button>
      )}
    </div>
  );
}
