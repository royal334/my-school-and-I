"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";

export function NotificationBell({ href }: { href: string }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    const loadUnreadCount = () => {
      fetch("/api/notifications?unread_only=true&limit=1")
        .then((response) => (response.ok ? response.json() : null))
        .then((data: { total_unread?: number } | null) => {
          if (active && data) setUnreadCount(data.total_unread ?? 0);
        })
        .catch(() => undefined);
    };

    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 60000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [pathname]);

  const hasUnread = unreadCount > 0;

  return (
    <Link
      href={href}
      title="Alerts"
      aria-label={hasUnread ? `Alerts, ${unreadCount} unread` : "Alerts"}
      data-tour="notification-bell"
      className="relative flex size-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 hover:text-white"
    >
      <Bell className="h-4 w-4" />
      {hasUnread && (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 size-2 rounded-full bg-accent-400 ring-2 ring-primary-950"
        />
      )}
    </Link>
  );
}
