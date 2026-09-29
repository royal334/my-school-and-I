import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { AdminSectionCard } from './admin-section-card';
import { ADMIN_SECTIONS } from './constants';

export function AdminHome() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary-600 px-4 py-5 dark:bg-primary-800">
        <Link
          href="/dashboard"
          className="mb-2 inline-flex items-center gap-2 no-underline"
        >
          <ArrowLeft className="size-4 text-white" />
          <span className="text-sm text-white/70">Back to dashboard</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white">
            <ShieldCheck className="size-5" />
          </span>
          <div className="min-w-0">
            <h1 className="font-display text-xl tracking-tight text-white">Admin</h1>
            <p className="mt-0.5 text-xs text-primary-200 dark:text-primary-300">
              Choose an area to manage
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {ADMIN_SECTIONS.map((section) => (
            <AdminSectionCard key={section.href} section={section} />
          ))}
        </div>
      </main>
    </div>
  );
}
