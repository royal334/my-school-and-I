'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

  if (isVendorAccount || !hasVendor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-muted p-1 dark:bg-muted" data-tour="dashboard-toggle">
      <Button
        variant={!isStudent ? 'ghost' : 'default'}
        size="sm"
        onClick={() => handleToggle(false)}
        className={cn(
          'flex items-center gap-2',
isStudent && 'bg-primary-600 text-white shadow-sm'
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
          !isStudent && 'bg-primary-600 text-white shadow-sm'
        )}
      >
        <Store className="h-4 w-4" />
        Vendor
      </Button>
    </div>
  );
}
