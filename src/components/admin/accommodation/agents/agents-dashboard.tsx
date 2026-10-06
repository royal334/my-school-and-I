'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { AgentProfile } from '@/components/agent/types';
import { AgentsHeader } from './agents-header';
import { AgentFilterTabs } from './agent-filter-tabs';
import { AgentApplicationRow } from './agent-application-row';
import { AgentsEmptyState } from './agents-empty-state';
import { AgentsLoadingSkeleton } from './agents-loading-skeleton';
import {
  AGENTS_PAGE_SIZE,
  getFilterLabel,
  isAgentFilterKey,
  type AgentFilterKey,
} from './constants';

export function AgentsDashboard({
  initialAgents,
  initialTotal,
  initialFilter,
}: {
  initialAgents: AgentProfile[];
  initialTotal: number;
  initialFilter: AgentFilterKey;
}) {
  const [agents, setAgents] = useState<AgentProfile[]>(initialAgents);
  const [total, setTotal] = useState(initialTotal);
  const [filter, setFilter] = useState<AgentFilterKey>(initialFilter);
  const [loadedFilter, setLoadedFilter] = useState<AgentFilterKey>(initialFilter);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  // The server seeds the first paint; refetch only when the filter changes.
  useEffect(() => {
    if (filter === loadedFilter) return;

    let active = true;

    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const query = new URLSearchParams({ limit: String(AGENTS_PAGE_SIZE) });
        if (filter) query.set('status', filter);

        const res = await fetch(`/api/admin/agents?${query.toString()}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load agents');
        if (!active) return;

        setAgents(data.agents ?? []);
        setTotal(data.pagination?.total ?? 0);
        setLoadedFilter(filter);
      } catch (e) {
        if (!active) return;
        setAgents([]);
        setLoadError(e instanceof Error ? e.message : 'Could not load agents');
        setLoadedFilter(filter);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [filter, loadedFilter]);

  function handleFilterChange(key: string) {
    if (!isAgentFilterKey(key)) return;
    setFilter(key);
  }

  const filterLabel = getFilterLabel(filter);

  return (
    <div className="min-h-screen bg-background pb-20">
      <AgentsHeader total={total} filterLabel={filterLabel} />
      <AgentFilterTabs value={filter} onChange={handleFilterChange} />

      <div className="flex flex-col gap-2.5 p-4">
        {loadError && (
          <p className="flex items-center gap-2 rounded-lg border border-error/20 bg-error-bg px-3.5 py-2.5 text-[13px] text-error-text">
            <AlertTriangle className="size-4 shrink-0" aria-hidden />
            {loadError}
          </p>
        )}

        {loading ? (
          <AgentsLoadingSkeleton />
        ) : agents.length === 0 ? (
          <AgentsEmptyState filterLabel={filterLabel} />
        ) : (
          agents.map(agent => <AgentApplicationRow key={agent.id} agent={agent} />)
        )}
      </div>
    </div>
  );
}