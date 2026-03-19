import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          404
        </h1>
        <h2 className="mb-4 text-2xl font-semibold text-slate-800">
          Page Not Found
        </h2>
        <p className="mb-8 text-slate-600 max-w-md mx-auto">
          Sorry, we couldn't find the page you're looking for. The link might be broken, or the page may have been removed.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button className="w-full sm:w-auto">
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}