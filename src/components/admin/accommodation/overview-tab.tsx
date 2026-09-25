'use client';

import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { StatCard } from './stat-card';
import { SectionHeader } from './section-header';
import { LeadRow } from './lead-row';
import { ViewingRow } from './viewing-row';
import type { Lead, Stats, Unit, Viewing } from './types';

export function OverviewTab({
  stats,
  expiringUnits,
  leads,
  viewings,
}: {
  stats: Stats | null;
  expiringUnits: Unit[];
  leads: Lead[];
  viewings: Viewing[];
}) {
  return (
    <div className="flex flex-col gap-5">
      <StatsGrid stats={stats} />
      <ExpiringAlert expiringUnits={expiringUnits} />

      <div>
        <SectionHeader title="Recent leads" href="/admin/accommodation?tab=leads" count={leads.length} />
        <div className="flex flex-col gap-2">
          {leads.length === 0 ? (
            <p className="py-4 text-[13px] text-stone-500 dark:text-stone-300">No leads yet.</p>
          ) : (
            leads.map(lead => <LeadRow key={lead.id} lead={lead} />)
          )}
        </div>
      </div>

      <div>
        <SectionHeader title="Recent viewings" href="/admin/accommodation?tab=viewings" count={viewings.length} />
        <div className="flex flex-col gap-2">
          {viewings.length === 0 ? (
            <p className="py-4 text-[13px] text-stone-500 dark:text-stone-300">No viewing requests yet.</p>
          ) : (
            viewings.map(v => <ViewingRow key={v.id} viewing={v} />)
          )}
        </div>
      </div>
    </div>
  );
}

function StatsGrid({ stats }: { stats: Stats | null }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <StatCard
        label="New leads"
        value={stats?.pending_leads || 0}
        color="text-accent-500"
        href="/admin/accommodation?tab=leads"
      />
      <StatCard
        label="Under review"
        value={stats?.reviewing_leads || 0}
        color="text-[#1A5C8A]"
        href="/admin/accommodation?tab=leads"
      />
      <StatCard
        label="Active listings"
        value={stats?.active_listings || 0}
        color="text-success"
        href="/admin/accommodation?tab=listings"
      />
      <StatCard
        label="Expiring soon"
        value={stats?.expiring_soon || 0}
        color="text-error"
        href="/admin/accommodation?tab=listings"
      />
      <StatCard
        label="Pending viewings"
        value={stats?.pending_viewings || 0}
        color="text-[#1A5C8A]"
        href="/admin/accommodation?tab=viewings"
      />
      <StatCard
        label="Scheduled viewings"
        value={stats?.scheduled_viewings || 0}
        color="text-primary-500"
        href="/admin/accommodation?tab=viewings"
      />
    </div>
  );
}

function ExpiringAlert({ expiringUnits }: { expiringUnits: Unit[] }) {
  if (expiringUnits.length === 0) return null;
  return (
    <div className="rounded-[10px] border border-[#C44B2A]/25 bg-error-bg px-3.5 py-3">
      <p className="mb-2 text-[13px] font-medium text-error">
        ⚠️ {expiringUnits.length} listing{expiringUnits.length > 1 ? 's' : ''} need re-verification
      </p>
      {expiringUnits.slice(0, 3).map(u => (
        <Link
          key={u.id}
          href={`/dashboard/admin/accommodation/properties/${u.id}`}
          className="block text-xs text-primary-600 no-underline dark:text-white"
        >
          → {u.property.name} · {u.unit_number || u.room_type}
          <span className="ml-1.5 text-error">
            Due{' '}
            {u.verification_due_at
              ? formatDistanceToNow(new Date(u.verification_due_at), { addSuffix: true })
              : 'now'}
          </span>
        </Link>
      ))}
    </div>
  );
}