'use client';

import { useState } from 'react';
import { Flame, RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Panel } from '../panel';
import { SectionTitle } from '../section-title';

interface ModerationPanelProps {
  status: string;
  isBoosted: boolean;
  acting: boolean;
  error: string;
  notifyMessage: string;
  onNotifyMessageChange: (value: string) => void;
  onUpdateStatus: (status: string, notify: boolean) => void;
  onRemoveBoost: () => void;
}

export function ModerationPanel({
  status,
  isBoosted,
  acting,
  error,
  notifyMessage,
  onNotifyMessageChange,
  onUpdateStatus,
  onRemoveBoost,
}: ModerationPanelProps) {
  const [focused, setFocused] = useState(false);
  const hasMessage = notifyMessage.trim().length > 0;
  const isActive = status === 'active';

  return (
    <Panel>
      <SectionTitle>Moderation</SectionTitle>

      <div className="mb-3">
        <label
          htmlFor="moderation-message"
          className="mb-1.5 block text-xs text-muted-foreground"
        >
          Message to seller <span className="text-muted-foreground/70">(optional)</span>
        </label>
        <textarea
          id="moderation-message"
          rows={2}
          value={notifyMessage}
          onChange={(event) => onNotifyMessageChange(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="e.g. Your listing was removed for violating our guidelines."
          className={cn(
            'w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 focus-visible:outline-none',
            focused ? 'border-primary-400 dark:border-primary-500' : 'border-input',
          )}
        />
        <p className="mt-1 text-[11px] text-muted-foreground">
          {hasMessage
            ? 'This message will be sent to the seller along with the action.'
            : 'Leave blank to change the status silently.'}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {isActive && (
          <ActionButton
            tone="error"
            icon={Trash2}
            acting={acting}
            onClick={() => onUpdateStatus('removed', hasMessage)}
          >
            Remove listing{hasMessage && ' & notify seller'}
          </ActionButton>
        )}

        {status === 'removed' && (
          <ActionButton
            tone="success"
            icon={RotateCcw}
            acting={acting}
            onClick={() => onUpdateStatus('active', hasMessage)}
          >
            Restore listing{hasMessage && ' & notify seller'}
          </ActionButton>
        )}

        {isBoosted && isActive && (
          <ActionButton tone="accent" icon={Flame} acting={acting} onClick={onRemoveBoost}>
            Remove boost
          </ActionButton>
        )}

        {!isActive && !isBoosted && status !== 'removed' && (
          <p className="text-xs text-muted-foreground">
            No moderation actions available for listings in “{status}”.
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-error-bg px-3 py-2 text-xs text-error-text">
          {error}
        </p>
      )}
    </Panel>
  );
}

type ActionTone = 'error' | 'success' | 'accent';

const TONE_CLASSES: Record<ActionTone, string> = {
  error: 'border-error/25 bg-error-bg text-error-text hover:border-error/40',
  success: 'border-success/25 bg-success-bg text-success-text hover:border-success/40',
  accent:
    'border-accent-300 bg-accent-100 text-accent-800 hover:border-accent-400 dark:border-accent-500/30 dark:bg-accent-500/10 dark:text-accent-300',
};

interface ActionButtonProps {
  tone: ActionTone;
  icon: typeof Trash2;
  acting: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function ActionButton({ tone, icon: Icon, acting, onClick, children }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={acting}
      className={cn(
        'inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
        TONE_CLASSES[tone],
      )}
    >
      <Icon className="size-4 shrink-0" />
      {children}
    </button>
  );
}
