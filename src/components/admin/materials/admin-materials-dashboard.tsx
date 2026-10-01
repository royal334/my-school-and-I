'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AdminMaterialsHeader } from './admin-materials-header';
import { OverviewTab } from './overview-tab';
import { SubmissionsTab } from './submissions-tab';
import { LibraryTab } from './library-tab';
import { UploadTab } from './upload-tab';
import type {
  AdminMaterial,
  AdminMaterialCourse,
  AdminMaterialsStats,
  AdminMaterialsTab,
  MaterialSubmission,
  TabTarget,
} from './types';

interface KeyedResult<T> {
  key: string;
  data: T;
}

export function AdminMaterialsDashboard({
  initialTab = 'overview',
  courses = [],
}: {
  initialTab?: AdminMaterialsTab;
  courses?: AdminMaterialCourse[];
}) {
  const [activeTab, setActiveTab] = useState<AdminMaterialsTab>(initialTab);

  const [stats, setStats] = useState<AdminMaterialsStats | null>(null);
  /** Bumped after any mutation so counts and lists re-sync. */
  const [revision, setRevision] = useState(0);

  const [submissionFilter, setSubmissionFilter] = useState('pending');
  const [submissionsResult, setSubmissionsResult] = useState<KeyedResult<MaterialSubmission[]> | null>(
    null,
  );

  const [libraryFilter, setLibraryFilter] = useState('published');
  const [libraryResult, setLibraryResult] = useState<KeyedResult<AdminMaterial[]> | null>(null);

  // Results are tagged with the request they belong to, so a stale response can
  // never render and `loading` falls out of the comparison.
  const submissionsKey = `${submissionFilter}|${revision}`;
  const submissionsLoading = submissionsResult?.key !== submissionsKey;
  const submissions = submissionsResult?.key === submissionsKey ? submissionsResult.data : [];

  const libraryKey = `${libraryFilter}|${revision}`;
  const libraryLoading = libraryResult?.key !== libraryKey;
  const library = libraryResult?.key === libraryKey ? libraryResult.data : [];

  useEffect(() => {
    let active = true;

    fetch('/api/admin/materials/stats')
      .then((res) => res.json())
      .then((data) => {
        if (active) setStats(data.stats ?? null);
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [revision]);

  useEffect(() => {
    let active = true;
    const key = submissionsKey;

    const params = new URLSearchParams();
    if (submissionFilter) params.set('status', submissionFilter);

    fetch(`/api/admin/materials/submissions?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setSubmissionsResult({ key, data: data.submissions ?? [] });
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [submissionFilter, submissionsKey]);

  useEffect(() => {
    let active = true;
    const key = libraryKey;

    const params = new URLSearchParams();
    if (libraryFilter) params.set('status', libraryFilter);

    fetch(`/api/admin/materials/library?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (active) setLibraryResult({ key, data: data.materials ?? [] });
      })
      .catch(console.error);

    return () => {
      active = false;
    };
  }, [libraryFilter, libraryKey]);

  const handleSubmissionReviewed = useCallback(
    (id: string, status: 'approved' | 'rejected') => {
      // Drop it locally so the pending queue shrinks without waiting for a refetch.
      setSubmissionsResult((prev) =>
        prev
          ? { ...prev, data: prev.data.filter((submission) => submission.id !== id) }
          : prev,
      );
      setRevision((n) => n + 1);
      toast.success(status === 'approved' ? 'Submission approved' : 'Submission rejected', {
        position: 'top-center',
      });
    },
    [],
  );

  const handleLibraryChange = useCallback(
    (id: string, action: 'publish' | 'unpublish' | 'delete') => {
      setLibraryResult((prev) =>
        prev ? { ...prev, data: prev.data.filter((material) => material.id !== id) } : prev,
      );
      setRevision((n) => n + 1);
      toast.success(
        action === 'delete'
          ? 'Material deleted'
          : action === 'publish'
            ? 'Material published'
            : 'Material unpublished',
        { position: 'top-center' },
      );
    },
    [],
  );

  const handleStatSelect = useCallback((target: TabTarget) => {
    const { tab, filter } = target;
    setActiveTab(tab);
    if (tab === 'submissions' && filter !== undefined) setSubmissionFilter(filter);
    if (tab === 'library' && filter !== undefined) setLibraryFilter(filter);
  }, []);

  const handleTabChange = useCallback((tab: AdminMaterialsTab) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <AdminMaterialsHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingSubmissions={stats?.pending_submissions ?? 0}
      />

      <div className="flex flex-col gap-4 p-4">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} onSelect={handleStatSelect} />
        )}

        {activeTab === 'submissions' && (
          <SubmissionsTab
            submissions={submissions}
            loading={submissionsLoading}
            filter={submissionFilter}
            onFilterChange={setSubmissionFilter}
            onReviewed={handleSubmissionReviewed}
          />
        )}

        {activeTab === 'library' && (
          <LibraryTab
            materials={library}
            loading={libraryLoading}
            filter={libraryFilter}
            onFilterChange={setLibraryFilter}
            onChange={handleLibraryChange}
          />
        )}

        {activeTab === 'upload' && (
          <UploadTab courses={courses} onUploaded={() => setRevision((n) => n + 1)} />
        )}
      </div>
    </div>
  );
}
