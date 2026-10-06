import type { ReactNode } from 'react';

export function DetailHeader({
  title,
  subtitle,
  badge,
  onBack,
}: {
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  onBack: () => void;
}) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="cursor-pointer border-none bg-transparent text-lg text-primary-300"
        >
          ←
        </button>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg leading-snug tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-0.5 text-xs text-primary-300">{subtitle}</p>}
        </div>
        {badge}
      </div>
    </header>
  );
}