'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck } from 'lucide-react';
import axios from 'axios'
import { useState } from 'react';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { requestPageLoader } from '@/components/providers/page-loader';

export function DashboardHeader({ displayName }: { displayName: string }) {

    const [loggingOut, setLoggingOut] = useState(false);

  
    const handleLogout = async () => {
      setLoggingOut(true);
      try {
        const response = await axios.post("/api/auth/logout");
        requestPageLoader();
        router.push(response.status === 200 ? "/" : "/login");
      } catch {
        requestPageLoader();
        router.push("/login");
      } finally {
        setLoggingOut(false);
      }
    };
  const router = useRouter();

  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex justify-between items-center">
        <div>
          <div className="mb-2 flex items-center gap-3">
            {/* <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="size-4.5" aria-hidden />
            </button> */}
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-200 dark:text-primary-300">
                Agent dashboard
              </p>
              <h1 className="text-lg tracking-tight text-white">{displayName}</h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-white">
            <BadgeCheck className="size-3" aria-hidden />
            Approved agent
          </span>
          </div>
        <div className="ml-auto flex items-center gap-2">
          <NotificationBell href="/agent/notifications" />         
          <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="h-fit rounded-lg bg-error px-3.5 py-2 text-sm text-white font-medium text-error-foreground transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
          {loggingOut ? 'Logging Out' : 'Log out'}
                </button>
        </div>
      </div>
    </header>
  );
}
