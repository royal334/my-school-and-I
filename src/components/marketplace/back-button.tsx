'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function BackButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => router.back()}
      aria-label="Go back"
      className="text-primary-foreground hover:bg-white/10"
    >
      <ArrowLeft className="size-5" />
    </Button>
  );
}