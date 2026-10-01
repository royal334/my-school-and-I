'use client';

import { useState } from 'react';
import { FileText, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardBody } from './card';
import { SectionTitle } from './section-title';
import { MATERIAL_TYPE_OPTIONS } from './constants';
import { formatBytes } from './utils';
import { MAX_FILE_SIZE_MB } from '@/utils/constants/constants';
import { generateUniqueFileName } from '@/utils/lib';
import { createClient } from '@/utils/supabase/client';
import type { AdminMaterialCourse } from './types';

const inputClass = cn(
  'w-full rounded-lg border border-[#C8E8DA] bg-white px-3 py-2 text-[13px] outline-none transition-colors',
  'placeholder:text-stone-400 focus:border-primary-500 dark:border-white/10 dark:bg-transparent dark:text-white',
);

const selectClass = cn(inputClass, 'cursor-pointer appearance-none');

const labelClass = 'mb-1 block text-[11px] font-medium text-stone-500 dark:text-stone-300';

const submitClass =
  'flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60';

export function UploadTab({
  courses,
  onUploaded,
}: {
  courses: AdminMaterialCourse[];
  onUploaded: () => void;
}) {
  const supabase = createClient();

  const [file, setFile] = useState<File | null>(null);
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('lecture_note');
  const [description, setDescription] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const ready = Boolean(file && courseId && title.trim());

  function pickFile(selected: File | null) {
    setError('');

    if (!selected) {
      setFile(null);
      return;
    }
    if (selected.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      setFile(null);
      return;
    }
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size must not exceed ${MAX_FILE_SIZE_MB}MB`);
      setFile(null);
      return;
    }

    setFile(selected);
  }

  function reset() {
    setFile(null);
    setCourseId('');
    setTitle('');
    setType('lecture_note');
    setDescription('');
    setIsPremium(false);
    setProgress(0);
  }

  async function submit() {
    if (!file || !ready) return;

    setUploading(true);
    setProgress(10);
    setError('');

    let storagePath: string | null = null;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be signed in to upload');

      const uniqueName = generateUniqueFileName(file.name);
      storagePath = `materials/${courseId}/${uniqueName}`;

      setProgress(30);

      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(storagePath, file, {
          contentType: 'application/pdf',
          upsert: false,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      setProgress(75);

      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filePath: storagePath,
          fileSize: file.size,
          fileName: file.name,
          courseId,
          title: title.trim(),
          type,
          description: description.trim() || '',
          isPremium,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProgress(100);
      toast.success('Material uploaded and published', { position: 'top-center' });
      reset();
      onUploaded();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Upload failed';

      // Don't leave an orphaned object behind when the database write failed.
      if (storagePath) {
        await supabase.storage.from('materials').remove([storagePath]);
      }

      setError(message);
      setProgress(0);
      toast.error(message, { position: 'top-center' });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3.5">
          <SectionTitle>New material</SectionTitle>

          <div>
            <span className={labelClass}>PDF file</span>
            {!file ? (
              <label
                htmlFor="material-file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#C8E8DA] bg-primary-50/50 px-6 py-8 text-center transition-colors hover:border-primary-400 hover:bg-primary-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-primary-500/50"
              >
                <Upload className="mb-2 size-5 text-primary-600 dark:text-primary-300" aria-hidden />
                <p className="text-[13px] text-stone-600 dark:text-stone-300">
                  <span className="font-medium text-primary-600 dark:text-primary-300">
                    Choose a PDF
                  </span>{' '}
                  or drag it here
                </p>
                <p className="mt-0.5 text-[11px] text-stone-400">PDF only · max {MAX_FILE_SIZE_MB}MB</p>
                <input
                  id="material-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3.5 py-3 dark:bg-white/5">
                <span className="flex min-w-0 items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-primary-600 dark:text-primary-300" aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-mono text-[13px] font-medium text-stone-700 dark:text-stone-100">
                      {file.name}
                    </span>
                    <span className="block text-[11px] text-stone-400">
                      {formatBytes(file.size)}
                    </span>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  aria-label="Remove file"
                  className="cursor-pointer border-none bg-transparent p-1 text-stone-400 transition-colors hover:text-error"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="material-title" className={labelClass}>
                Title
              </label>
              <input
                id="material-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Electrical Power Systems I — Lecture Notes"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="material-course" className={labelClass}>
                Course
              </label>
              <select
                id="material-course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className={selectClass}
              >
                <option value="" className="bg-white dark:bg-card">
                  Select a course…
                </option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id} className="bg-white dark:bg-card">
                    {course.course_code} — {course.course_title}
                    {course.level ? ` (${course.level}L` : ''}
                    {course.semester ? `, Sem ${course.semester})` : ')'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="material-type" className={labelClass}>
                Material type
              </label>
              <select
                id="material-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={selectClass}
              >
                {MATERIAL_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value} className="bg-white dark:bg-card">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="material-description" className={labelClass}>
                Description <span className="text-stone-400">(optional)</span>
              </label>
              <textarea
                id="material-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Anything students should know about this material…"
                className={cn(inputClass, 'resize-y')}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5">
            <input
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="size-4 cursor-pointer accent-primary-600"
            />
            <span className="text-[13px] text-stone-600 dark:text-stone-300">
              Premium — require an active subscription to access
            </span>
          </label>

          {uploading && progress > 0 && progress < 100 && (
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted dark:bg-white/10">
              <div
                className="h-full rounded-full bg-primary-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {error && (
            <p role="alert" className="rounded-lg bg-error-bg px-3 py-2 text-xs text-error-text">
              {error}
            </p>
          )}

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="cursor-pointer rounded-lg border-none bg-muted px-4 py-2.5 text-[13px] font-medium text-stone-600 transition-colors hover:bg-muted/70 disabled:cursor-not-allowed disabled:opacity-60 dark:text-stone-200"
            >
              Clear
            </button>
            <button type="button" onClick={submit} disabled={!ready || uploading} className={submitClass}>
              <Upload className="size-4" aria-hidden />
              {uploading ? 'Uploading…' : 'Upload & publish'}
            </button>
          </div>

          {courses.length === 0 && (
            <p className="text-[11px] leading-relaxed text-stone-400">
              No courses are in the coursebook yet. Add a course before uploading, or approve a
              student submission — that flow creates the course for you.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
