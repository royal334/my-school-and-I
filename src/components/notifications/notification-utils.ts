import {
  Bell,
  Megaphone,
  Store,
  ShoppingBag,
  Home,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import type { Notification } from './types';

const TYPE_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  announcement: {
    icon: Megaphone,
    color: 'bg-info-bg text-info',
    label: 'Announcement',
  },
  vendor: {
    icon: Store,
    color: 'bg-secondary text-secondary-foreground',
    label: 'Vendor',
  },
  marketplace: {
    icon: ShoppingBag,
    color: 'bg-primary-50 text-primary-600 dark:bg-muted dark:text-primary-400',
    label: 'Marketplace',
  },
  accommodation: {
    icon: Home,
    color: 'bg-warning-bg text-warning',
    label: 'Accommodation',
  },
  platform: {
    icon: Sparkles,
    color: 'bg-accent-100 text-accent-800 dark:bg-accent-500/15 dark:text-accent-300',
    label: 'Platform',
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  color: 'bg-muted text-muted-foreground',
  label: 'Notification',
};

export function getNotificationConfig(typeKey: string | null | undefined) {
  return TYPE_CONFIG[typeKey || ''] || DEFAULT_CONFIG;
}

export function getNotificationIcon(typeKey: string | null | undefined) {
  return getNotificationConfig(typeKey).icon;
}

export function getNotificationColor(typeKey: string | null | undefined) {
  return getNotificationConfig(typeKey).color;
}

export function formatNotificationType(typeKey: string | null | undefined) {
  return getNotificationConfig(typeKey).label;
}

export function getDeeplink(data: Record<string, unknown>): string | null {
  if (typeof data.deeplink === 'string') return data.deeplink;
  if (typeof data.url === 'string') return data.url;
  if (typeof data.announcement_id === 'string') return `/dashboard/announcements/${data.announcement_id}`;
  if (typeof data.vendor_id === 'string') return `/dashboard/vendors/${data.vendor_id}`;
  if (typeof data.material_id === 'string') return `/dashboard/materials/${data.material_id}`;
  return null;
}

const TYPE_PRIORITY: Record<string, number> = {
  platform: 0,
  announcement: 1,
  vendor: 2,
  marketplace: 3,
  accommodation: 4,
};

export function sortNotifications(notifications: Notification[]) {
  return [...notifications].sort((a, b) => {
    if (a.is_read !== b.is_read) return a.is_read ? 1 : -1;

    const aType = a.notification_type?.type_key || '';
    const bType = b.notification_type?.type_key || '';
    const priorityDiff = (TYPE_PRIORITY[aType] ?? 5) - (TYPE_PRIORITY[bType] ?? 5);
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
