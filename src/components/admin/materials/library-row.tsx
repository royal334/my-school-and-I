'use client';

import { useState } from 'react';
import { BookOpen, Download, Eye, FileText, Lock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardBody } from './card';
import { StatusBadge } from './status-badge';
import { getMaterialTypeLabel, getMaterialVisibilityTone } from './constants';
import { formatBytes, formatCount } from './utils';
import type { AdminMaterial } from './types';

const actionClass =
  'inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60';

export function LibraryRow({
  material,
  onChange,
}: {
  material: AdminMaterial;
  onChange: (id: string, action: 'publish' | 'unpublish' | 'delete') => void;
}) {
  const [busy, setBusy] = useState<'publish' | 'unpublish' | 'delete' | null>(null);
  const [error, setError] = useState('');
  const tone = getMaterialVisibilityTone(material.is_approved);

  async function act(action: 'publish' | 'unpublish' | 'delete') {
    if (action === 'delete' && !window.confirm(`Delete “${material.title}” permanently?`)) {
      return;
    }

    setBusy(action);
    setError('');

    try {
      const res = await fetch(`/api/admin/materials/library/${material.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onChange(material.id, action);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'An unexpected error occurred';
      setError(message);
      toast.error(message, { position: 'top-center' });
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div
        className={cn(
          'flex items-center justify-between gap-2 border-b border-[#D6E5DF] px-4 py-2.5 dark:border-white/10',
          tone.tone,
        )}
      >
        <StatusBadge tone={tone} />
        {material.is_premium && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.06em]">
            <Lock className="size-3" aria-hidden />
            Premium
          </span>
        )}
      </div>

      <CardBody>
        <h3 className="font-display text-[15px] tracking-tight text-primary-700 dark:text-white">
          {material.title}
        </h3>

        {material.course && (
          <p className="mt-1 text-xs text-stone-500 dark:text-stone-300">
            {material.course.course_code} · {material.course.course_title}
            {material.course.level ? ` · ${material.course.level}L` : ''}
            {material.course.semester ? ` · Sem ${material.course.semester}` : ''}
          </p>
        )}

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-[11px] text-primary-700 dark:bg-primary-500/15 dark:text-primary-200">
            <FileText className="size-3 shrink-0" aria-hidden />
            {getMaterialTypeLabel(material.type)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-stone-600 dark:bg-white/5 dark:text-stone-300">
            <Download className="size-3 shrink-0" aria-hidden />
            {formatCount(material.download_count)}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11px] text-stone-600 dark:bg-white/5 dark:text-stone-300">
            <Eye className="size-3 shrink-0" aria-hidden />
            {formatCount(material.view_count)}
          </span>
        </div>

        <p className="mt-2 text-[11px] text-stone-400">
          <span className="font-mono">{material.file_name}</span> · {formatBytes(material.file_size_bytes)}
          {material.uploader?.full_name ? ` · by ${material.uploader.full_name}` : ''}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {material.is_approved ? (
            <button
              type="button"
              onClick={() => act('unpublish')}
              disabled={busy !== null}
              className={cn(
                actionClass,
                'border-border bg-muted text-stone-600 hover:text-foreground dark:border-white/10 dark:text-stone-300',
              )}
            >
              <Eye className="size-3.5" aria-hidden />
              {busy === 'unpublish' ? 'Unpublishing…' : 'Unpublish'}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => act('publish')}
              disabled={busy !== null}
              className={cn(actionClass, 'border-success/25 bg-success-bg text-success hover:bg-success/15')}
            >
              <BookOpen className="size-3.5" aria-hidden />
              {busy === 'publish' ? 'Publishing…' : 'Publish'}
            </button>
          )}

          <button
            type="button"
            onClick={() => act('delete')}
            disabled={busy !== null}
            className={cn(actionClass, 'border-error/25 bg-error-bg text-error hover:bg-error/15')}
          >
            <Trash2 className="size-3.5" aria-hidden />
            {busy === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-[11px] text-error">
            {error}
          </p>
        )}
      </CardBody>
    </Card>
  );
}
