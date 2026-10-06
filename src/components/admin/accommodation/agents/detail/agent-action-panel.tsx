'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { TONE_CLASSES } from '@/components/agent/status-meta';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { AGENT_ACTIONS, type AgentAction, type AgentActionKey } from './constants';
import type { AdminAgent } from '@/components/agent/types';

const inputClass =
  'w-full rounded-lg border border-input bg-card px-3 py-2.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-primary focus:ring-[3px] focus:ring-primary/15 dark:bg-white/[0.03]';

const textareaClass = cn(inputClass, 'resize-y');

const actionButtonClass =
  'flex w-full cursor-pointer items-center gap-2 rounded-lg border px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors hover:brightness-[0.98] motion-reduce:transition-none';

export function AgentActionPanel({
  agent,
  onUpdate,
}: {
  agent: AdminAgent;
  onUpdate: (updated: AdminAgent) => void;
}) {
  const [pending, setPending] = useState<AgentAction | null>(null);
  const [agentFeedback, setAgentFeedback] = useState('');
  const [reviewNote, setReviewNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const actions = AGENT_ACTIONS[agent.status] ?? [];
  const PendingIcon = pending?.icon;

  async function confirmAction(key: AgentActionKey) {
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/agents/${agent.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: key,
          review_note: reviewNote.trim() || null,
          agent_feedback: agentFeedback.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update the agent');

      onUpdate({ ...agent, ...data.agent });
      setPending(null);
      setAgentFeedback('');
      setReviewNote('');
      toast.success('Agent updated', { position: 'top-center' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the agent');
    } finally {
      setSaving(false);
    }
  }

  function cancelAction() {
    setPending(null);
    setError('');
  }

  return (
    <Card>
      <SectionTitle>Actions</SectionTitle>

      {!pending && actions.length === 0 && (
        <p className="mt-1 text-[13px] text-muted-foreground">
          No further actions are available for this agent.
        </p>
      )}

      {!pending && actions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {actions.map(action => {
            const Icon = action.icon;
            const tone = TONE_CLASSES[action.tone];
            return (
              <button
                key={action.key}
                type="button"
                onClick={() => {
                  setError('');
                  setPending(action);
                }}
                className={cn(actionButtonClass, tone.badge)}
              >
                <Icon className="size-4 shrink-0" aria-hidden />
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {pending && PendingIcon && (
        <div className="mt-2.5 flex flex-col gap-3">
          <p className="flex items-center gap-2 text-[13px] font-medium text-foreground">
            <PendingIcon className="size-4 text-primary-600 dark:text-primary-300" aria-hidden />
            {pending.label}
          </p>

          <div>
            <label
              htmlFor={`agent-feedback-${agent.id}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Message to agent (shown to them)
            </label>
            <textarea
              id={`agent-feedback-${agent.id}`}
              rows={3}
              placeholder="What should the agent see about this decision…"
              value={agentFeedback}
              onChange={e => setAgentFeedback(e.target.value)}
              className={textareaClass}
            />
          </div>

          <div>
            <label
              htmlFor={`agent-review-note-${agent.id}`}
              className="mb-1 block text-xs text-muted-foreground"
            >
              Internal note (staff only, not shown to the agent)
            </label>
            <textarea
              id={`agent-review-note-${agent.id}`}
              rows={2}
              placeholder="Private notes for the team…"
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              className={textareaClass}
            />
          </div>

          {error && <p className="text-[13px] text-error-text">{error}</p>}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => confirmAction(pending.key)}
              disabled={saving}
              className="min-h-[44px] flex-1 cursor-pointer rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-primary-500"
            >
              {saving ? 'Saving…' : 'Confirm'}
            </button>
            <button
              type="button"
              onClick={cancelAction}
              disabled={saving}
              className="min-h-[44px] cursor-pointer rounded-lg bg-muted px-4 text-[13px] font-medium text-foreground transition-colors hover:bg-border disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Card>
  );
}