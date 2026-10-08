'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DashboardHeader } from './dashboard-header';
import { DashboardLoading } from './dashboard-loading';
import { AgentInviteCard } from './agent-invite-card';
import { PendingApprovalCard } from './pending-approval-card';
import { DashboardStatsGrid } from './dashboard-stats-grid';
import { CommissionSummaryCard } from './commission-summary-card';
import { QuickActions } from './quick-actions';
import { DashboardDisclaimer } from './dashboard-disclaimer';
import { AgentPromptModals } from './agent-prompt-modals';
import type { DashboardAgent, DashboardCommissionSummary } from './types';

export function AgentDashboardView() {
  const [agent, setAgent] = useState<DashboardAgent | null>(null);
  const [summary, setSummary] = useState<DashboardCommissionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (signal?: AbortSignal) => {
    try {
      const profileResponse = await fetch('/api/agent/profile', { signal });
      const profileData = await readApiResponse<{ agent: DashboardAgent | null }>(
        profileResponse,
        'Agent profile',
      );
      setAgent(profileData.agent ?? null);

      if (profileData.agent?.status === 'approved') {
        const commissionResponse = await fetch('/api/agent/commissions', { signal });
        const commissionData = await readApiResponse<{
          summary: DashboardCommissionSummary;
        }>(commissionResponse, 'Agent commissions');
        setSummary(commissionData.summary ?? null);
      } else {
        setSummary(null);
      }
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      console.error('Could not load agent dashboard:', caught);
      setError(
        caught instanceof Error
          ? caught.message
          : 'Could not load the agent dashboard. Please try again.',
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  function handleRetry() {
    setLoading(true);
    setError(null);
    void fetchAll();
  }

  useEffect(() => {
    const controller = new AbortController();
    void Promise.resolve().then(() => fetchAll(controller.signal));
    return () => controller.abort();
  }, [fetchAll]);

  if (loading) return <DashboardLoading />;

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div role="alert" className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <h1 className="font-semibold text-foreground">Could not load the agent dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
          <Button type="button" className="mt-4" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  if (!agent) return <AgentInviteCard />;

  if (agent.status !== 'approved') return <PendingApprovalCard status={agent.status} />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <DashboardHeader displayName={agent.display_name} />

      <div className="flex flex-col gap-4 p-4">
        <DashboardStatsGrid agent={agent} />

        {summary && <CommissionSummaryCard summary={summary} />}

        <QuickActions />

        <DashboardDisclaimer />
      </div>

      <AgentPromptModals />
    </div>
  );
}

async function readApiResponse<T>(response: Response, label: string): Promise<T> {
  const body = await response.text();
  let data: unknown;

  try {
    data = body ? JSON.parse(body) : {};
  } catch {
    throw new Error(
      `${label} returned an invalid response (HTTP ${response.status}). Please try again or contact support.`,
    );
  }

  if (!response.ok) {
    const apiError =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof data.error === 'string'
        ? data.error
        : `${label} request failed (HTTP ${response.status}).`;
    throw new Error(apiError);
  }

  return data as T;
}
