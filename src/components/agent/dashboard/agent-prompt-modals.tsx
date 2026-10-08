'use client';

import { useEffect, useRef, useState } from 'react';
import { InstallPromptModal } from '@/components/pwa/install-prompt-modal';
import {
  NotificationPromptModal,
  shouldShowNotificationPrompt,
} from '@/components/notifications/notification-prompt-modal';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

/** Lets the page settle (and `beforeinstallprompt` fire) before prompting. */
const PROMPT_DELAY_MS = 2000;
const MAX_POLL_ATTEMPTS = 5;

function shouldPromptNotifications(): boolean {
  if (typeof window === 'undefined') return false;
  // `denied` can never be granted again, so don't nag about it.
  if (Notification.permission !== 'default') return false;
  return shouldShowNotificationPrompt();
}

/** Prompts for push notifications (when permission is still pending) and for
 *  installing the app (when it isn't on the device yet). The install prompt
 *  waits for the notification dialog to close, so only one shows at a time. */
export function AgentPromptModals() {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [installOpen, setInstallOpen] = useState(false);
  const { canInstall, isIOS, isInstalled, hasDismissedInstall } = useInstallPrompt();

  const canPromptInstall = !isInstalled && !hasDismissedInstall() && (canInstall || isIOS);
  const canPromptInstallRef = useRef(canPromptInstall);

  useEffect(() => {
    canPromptInstallRef.current = canPromptInstall;
  }, [canPromptInstall]);

  useEffect(() => {
    let attempts = 0;

    const id = window.setInterval(() => {
      attempts += 1;

      if (shouldPromptNotifications()) {
        setNotificationOpen(true);
        window.clearInterval(id);
        return;
      }

      if (canPromptInstallRef.current) {
        setInstallOpen(true);
        window.clearInterval(id);
        return;
      }

      if (attempts >= MAX_POLL_ATTEMPTS) window.clearInterval(id);
    }, PROMPT_DELAY_MS);

    return () => window.clearInterval(id);
  }, []);

  const handleNotificationOpenChange = (next: boolean) => {
    setNotificationOpen(next);
    if (!next && canPromptInstallRef.current) setInstallOpen(true);
  };

  return (
    <>
      <NotificationPromptModal
        open={notificationOpen}
        onOpenChange={handleNotificationOpenChange}
      />
      <InstallPromptModal open={installOpen} onOpenChange={setInstallOpen} />
    </>
  );
}
