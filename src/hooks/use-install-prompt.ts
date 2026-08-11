'use client';

import { useCallback, useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALL_DISMISSED_KEY = 'unihub_install_dismissed';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(display-mode: standalone)').matches) return true;
  const nav = navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(() =>
    typeof window !== 'undefined' && isStandalone(),
  );

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const canInstall = !isInstalled && !!deferredPrompt;
  const isIOS =
    typeof window !== 'undefined' && /ipad|iphone|ipod/i.test(window.navigator.userAgent);

  const hasDismissedInstall = useCallback(() => {
    if (typeof window === 'undefined') return true;
    try {
      return localStorage.getItem(INSTALL_DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  }, []);

  const dismissInstall = useCallback(() => {
    try {
      localStorage.setItem(INSTALL_DISMISSED_KEY, '1');
    } catch {
      // ignore
    }
  }, []);

  const promptInstall = useCallback(async () => {
    const prompt = deferredPrompt;
    if (!prompt) return false;
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        return true;
      }
    } catch {
      // user closed the browser prompt before choosing
    } finally {
      setDeferredPrompt(null);
    }
    return false;
  }, [deferredPrompt]);

  return {
    canInstall,
    isInstalled,
    isIOS,
    hasDismissedInstall,
    dismissInstall,
    promptInstall,
  };
}
