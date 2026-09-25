import { STEPS } from './constants';

export function SubmitHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <div className="bg-[#1A3C34] px-4 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Go back"
          className="-ml-1 cursor-pointer border-none bg-transparent p-1 text-xl text-[#7EC8A0] transition-colors hover:text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-lg tracking-[-0.01em] text-white">Submit a vacancy</h1>
          <p className="text-xs text-[#7EC8A0]">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>
      </div>
    </div>
  );
}