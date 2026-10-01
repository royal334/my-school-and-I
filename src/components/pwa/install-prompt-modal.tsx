'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Download, Share, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useInstallPrompt } from '@/hooks/use-install-prompt';

interface InstallPromptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InstallPromptModal({ open, onOpenChange }: InstallPromptModalProps) {
  const { canInstall, isInstalled, isIOS, promptInstall, dismissInstall } = useInstallPrompt();
  const [installing, setInstalling] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (!next && !isInstalled) dismissInstall();
    onOpenChange(next);
  };

  const handleInstall = async () => {
    if (installing) return;
    setInstalling(true);
    const accepted = await promptInstall();
    setInstalling(false);
    if (accepted) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm z-[130]">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <Image
            src="/campus-and-me-logo.png"
            alt="Campus&Me logo"
            width={72}
            height={72}
            priority
            className="rounded-2xl"
          />
          <DialogHeader className="items-center text-center">
            <DialogTitle style={{ fontFamily: "var(--font-display)" }}>Install Campus&Me</DialogTitle>
            <DialogDescription>
              Get a full-screen app experience with one-tap access from your home screen — no app
              store required.
            </DialogDescription>
          </DialogHeader>
        </div>

        {isIOS ? (
          <div className="rounded-lg border border-border dark:border-border bg-muted dark:bg-muted p-4 text-sm">
            <p className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Share className="h-4 w-4" /> How to add Campus&Me to your home screen
            </p>
            <ol className="space-y-1.5 text-muted-foreground">
              <li>
                1. Tap the <strong className="font-medium text-foreground">Share</strong> button in
                Safari&apos;s toolbar.
              </li>
              <li>
                2. Scroll down and tap{' '}
                <strong className="font-medium text-foreground">Add to Home Screen</strong>.
              </li>
              <li>
                3. Tap <strong className="font-medium text-foreground">Add</strong> in the
                top-right corner.
              </li>
            </ol>
          </div>
        ) : (
          <div className="rounded-lg border border-border dark:border-border bg-muted dark:bg-muted p-4 text-sm text-muted-foreground">
            <p className="flex items-start gap-2">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Campus&Me will be installed directly on your device and open in its own window, just
                like an app from an app store.
              </span>
            </p>
          </div>
        )}

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Maybe later
          </Button>
          {!isIOS && (
            <Button onClick={handleInstall} disabled={installing || !canInstall} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Download className="h-4 w-4" />
              {installing ? 'Installing…' : 'Install'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
