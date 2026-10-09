import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function AgentsHeader({
  total,
  filterLabel,
}: {
  total: number;
  filterLabel: string;
}) {
  return (
    <header className="bg-primary-600 px-4 py-4 dark:bg-primary-800">
      <div>
        <Link href="/admin" className="flex  gap-2">
          <ArrowLeft className="mb-2 h-4 w-4 text-white" />
          <p className="text-sm text-white/60">Back to admin</p>
        </Link>
        <h1 className="text-xl tracking-tight text-white">Agent applications</h1>
        <p className="mt-0.5 text-xs text-primary-200 dark:text-primary-300">
          {total} {filterLabel || 'total'} agent{total !== 1 ? 's' : ''}
        </p>
      </div>
    </header>
  );
}