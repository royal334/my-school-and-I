"use client";

import { ArrowLeft } from "lucide-react";
import { STEPS } from "./submit-constants";

interface SubmitHeaderProps {
  step: number;
  onBack: () => void;
}

export function SubmitHeader({ step, onBack }: SubmitHeaderProps) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="mb-2 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1.5 flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full bg-transparent text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="size-4.5" aria-hidden />
        </button>
        <div className="min-w-0">
          <h1 className="text-lg tracking-tight text-white">Submit property</h1>
          <p className="text-xs text-primary-200 dark:text-primary-300">
            Step {step + 1} of {STEPS.length}  {STEPS[step]}
          </p>
        </div>
      </div>
      <div className="mt-2 flex gap-1">
        {STEPS.map((_, i) => (
          <div
            key={i}
            className={[
              "h-[3px] flex-1 rounded-full transition-[background] duration-250 motion-reduce:transition-none",
              i <= step ? "bg-primary-400 dark:bg-primary-300" : "bg-white/20",
            ].join(" ")}
          />
        ))}
      </div>
    </header>
  );
}
