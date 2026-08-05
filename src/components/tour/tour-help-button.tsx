'use client';

import { useEffect, useRef } from 'react';
import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTourStore } from './tour-store';

interface TourHelpButtonProps {
  hasVendor: boolean;
  isVendorAccount: boolean;
  className?: string;
}

export function TourHelpButton({ hasVendor, isVendorAccount, className }: TourHelpButtonProps) {
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
    <Button
      variant="ghost"
      size="icon"
      className={className ?? 'size-8'}
      onClick={() => start(isVendorViewRef.current ? 'vendor' : 'student')}
      title="Take the dashboard tour"
      aria-label="Take the dashboard tour"
    >
      <HelpCircle className="h-4 w-4" />
    </Button>
  );
}
