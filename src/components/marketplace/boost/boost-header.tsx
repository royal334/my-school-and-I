import { BackButton } from '@/components/marketplace/back-button';

interface BoostHeaderProps {
  title: string;
}

export function BoostHeader({ title }: BoostHeaderProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-primary p-3 dark:bg-primary-900">
      <BackButton />
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-white">Boost listing</h1>
        <p className="truncate text-xs text-white/70">{title}</p>
      </div>
    </div>
  );
}