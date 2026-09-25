'use client';

import { useCallback, useState } from 'react';
import { AccommodationHeader } from './accommodation-header';
import { LeadsTab } from './leads-tab';
import { ListingsTab } from './listings-tab';
import { OverviewTab } from './overview-tab';
import { ViewingsTab } from './viewings-tab';
import { buildDashboardSnapshot, type DashboardSnapshot } from './utils';
import type { Tab } from './types';

type SnapshotSeed = Pick<DashboardSnapshot, 'stats' | 'leads' | 'units' | 'viewings'>;

export function AccommodationDashboard({
  initialData,
  initialTab = 'overview',
}: {
  initialData: SnapshotSeed;
  initialTab?: Tab;
}) {
  const [stats, setStats] = useState(initialData.stats);
  const [leads, setLeads] = useState(initialData.leads);
  const [units, setUnits] = useState(initialData.units);
  const [viewings, setViewings] = useState(initialData.viewings);
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  const fetchAll = useCallback(async () => {
    try {
      const [leadsRes, propertiesRes, viewingsRes] = await Promise.all([
        fetch('/api/admin/accommodation/leads?limit=5'),
        fetch('/api/admin/accommodation/properties'),
        fetch('/api/admin/accommodation/viewings?limit=5'),
      ]);

      const [leadsData, propertiesData, viewingsData] = await Promise.all([
        leadsRes.json(),
        propertiesRes.json(),
        viewingsRes.json(),
      ]);

      const snapshot = buildDashboardSnapshot(
        leadsData.leads || [],
        propertiesData.properties || [],
        viewingsData.viewings || [],
      );

      setStats(snapshot.stats);
      setLeads(snapshot.leads);
      setUnits(snapshot.units);
      setViewings(snapshot.viewings);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const expiringUnits = units.filter(u => {
    if (!u.verification_due_at) return false;
    const due = new Date(u.verification_due_at);
    const soon = new Date();
    soon.setDate(soon.getDate() + 3);
    return due <= soon && u.availability_status === 'available';
  });

  return (
    <div className="min-h-screen bg-[#F0F5F3] pb-20 dark:bg-background">
      <AccommodationHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="p-4">
        {activeTab === 'overview' && (
          <OverviewTab stats={stats} expiringUnits={expiringUnits} leads={leads} viewings={viewings} />
        )}
        {activeTab === 'leads' && <LeadsTab />}
        {activeTab === 'listings' && <ListingsTab units={units} onVerified={fetchAll} />}
        {activeTab === 'viewings' && <ViewingsTab />}
      </div>
    </div>
  );
}