import Link from 'next/link';
import { format } from 'date-fns';
import { StatusBadge } from './status-badge';
import type { Viewing } from './types';

export function ViewingRow({ viewing, detailed = false }: { viewing: Viewing; detailed?: boolean }) {
  return (
    <Link href={`/admin/accommodation/viewings/${viewing.id}`} className="block no-underline">
      <div className="flex items-center justify-between gap-2.5 rounded-[10px] border border-[#D6E5DF] bg-white p-3 dark:border-white/10 dark:bg-card">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate text-sm font-medium text-primary-600 dark:text-white">
            {viewing.student_name}
          </p>
          <p className="truncate text-xs text-stone-500 dark:text-stone-300">
            {viewing.unit?.property?.name} · {viewing.unit?.room_type}
            {!detailed && viewing.preferred_date && ` · ${format(new Date(viewing.preferred_date), 'MMM d')}`}
          </p>
          {detailed && (
            <p className="mt-0.5 truncate text-[11px] text-stone-500 dark:text-stone-400">
              {viewing.preferred_date
                ? `Preferred: ${format(new Date(viewing.preferred_date), 'MMM d')} ${viewing.preferred_time || ''}`
                : 'No preferred date'}
              {' · '}
              {viewing.student_phone}
            </p>
          )}
        </div>
        <StatusBadge status={viewing.status} />
      </div>
    </Link>
  );
}