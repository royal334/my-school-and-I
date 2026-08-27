import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F0F5F3] p-4 dark:bg-[#0F1A17]">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#FDEAE5]">
          <AlertCircle className="h-12 w-12 text-[#C44B2A]" />
        </div>
        
        <h1 className="mb-2 text-4xl tracking-tight text-[#1A3C34] sm:text-5xl" style={{ fontFamily: "var(--font-display)" }}>
          404
        </h1>
        <h2 className="mb-4 text-2xl text-[#1A3C34]" style={{ fontFamily: "var(--font-display)" }}>
          Page not found
        </h2>
        <p className="mb-8 text-[#6B7B75] dark:text-[#A8C8BB] max-w-md mx-auto">
          Sorry, we couldn&apos;t find the page you&apos;re looking for. The link might be broken, or the page may have been removed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF]">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
