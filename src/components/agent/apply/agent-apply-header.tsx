'use client';

import { ArrowLeft } from 'lucide-react';
import { AGENT_STEPS } from '../constants';

export function AgentApplyHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg tracking-tight text-white">Become an agent</h1>
          <p className="text-xs text-primary-200 dark:text-primary-300">
            Step {step + 1} of {AGENT_STEPS.length} — {AGENT_STEPS[step]}
          </p>
        </div>
      </div>
    </header>
  );
}

export function AgentStepBar({ current }: { current: number }) {
  return (
    <div
      className="flex gap-1 px-4 py-3"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={AGENT_STEPS.length}
      aria-valuenow={current + 1}
      aria-label="Application progress"
    >
      {AGENT_STEPS.map((label, i) => (
        <div
          key={label}
          className={[
            'h-[3px] flex-1 rounded-full transition-[background] duration-250 motion-reduce:transition-none',
            i <= current ? 'bg-primary-600 dark:bg-primary-400' : 'bg-primary-100 dark:bg-white/10',
          ].join(' ')}
        />
      ))}
    </div>
  );
}