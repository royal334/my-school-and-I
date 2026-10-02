'use client';

import { useCallback, useState } from 'react';
import { Bell, BellRing } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  isPushSupported,
  requestNotificationPermission,
} from '@/utils/lib/notifications';

const DISMISSED_KEY = 'unihub_notifications_dismissed';

export function hasDismissedNotifications(): boolean {
  try {
    return localStorage.getItem(DISMISSED_KEY) === '1';
  } catch {
    return false;
  }
}

function dismissNotifications() {
  try {
    localStorage.setItem(DISMISSED_KEY, '1');
  } catch {
    // ignore
  }
}

export function shouldShowNotificationPrompt(): boolean {
  return (
    isPushSupported() &&
    Notification.permission !== 'granted' &&
    !hasDismissedNotifications()
  );
}

interface NotificationPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationPromptModal({ open, onOpenChange }: NotificationPromptModalProps) {
  const [enabling, setEnabling] = useState(false);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (!next) dismissNotifications();
      onOpenChange(next);
    },
    [onOpenChange],
  );

  const handleEnable = useCallback(async () => {
    if (enabling) return;
    setEnabling(true);
    try {
      const token = await requestNotificationPermission();
      if (!token) {
        toast.error('Notification permission was denied');
        dismissNotifications();
        onOpenChange(false);
        return;
      }

      const tokenResponse = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!tokenResponse.ok) throw new Error('Failed to register device');

      await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement_notifications: true, vendor_notifications: true }),
      });

      toast.success('Notifications enabled');
      onOpenChange(false);
    } catch {
      toast.error('Failed to enable notifications');
      dismissNotifications();
      onOpenChange(false);
    } finally {
      setEnabling(false);
    }
  }, [enabling, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm z-[130]">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <BellRing className="h-8 w-8 text-primary" />
          </div>
          <DialogHeader className="items-center text-center">
            <DialogTitle>Stay in the loop</DialogTitle>
            <DialogDescription>
              Get notified about announcements, vendor updates, and important campus events — even
              when you&apos;re not using the app.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
          <p className="flex items-start gap-2">
            <Bell className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              You can change which notifications you receive at any time from{' '}
              <strong className="font-medium text-foreground">Settings</strong>.
            </span>
          </p>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Maybe later
          </Button>
          <Button onClick={handleEnable} disabled={enabling}>
            <Bell className="h-4 w-4" />
            {enabling ? 'Enabling…' : 'Enable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
