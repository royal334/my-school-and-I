import type {
  Lead,
  PropertyWithUnits,
  Stats,
  Unit,
  Viewing,
} from './types';

export function formatPrice(p: number) {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(p);
}

// Light backgrounds (used on white cards)
export const STATUS_BADGE_CLASSES: Record<string, string> = {
  pending: 'bg-[#FFF0D4] text-[#9E6A08]',
  reviewing: 'bg-[#DDE9F1] text-[#1A5C8A]',
  approved: 'bg-success-bg text-success',
  rejected: 'bg-error-bg text-error',
  duplicate: 'bg-[#E1EBE6] text-stone-500',
  available: 'bg-success-bg text-success',
  pending_reverification: 'bg-[#FFF0D4] text-[#9E6A08]',
  unavailable: 'bg-[#E1EBE6] text-stone-500',
  rented: 'bg-[#DDE9F1] text-[#1A5C8A]',
  expired: 'bg-error-bg text-error',
  scheduled: 'bg-[#DDE9F1] text-[#1A5C8A]',
  completed: 'bg-success-bg text-success',
  cancelled: 'bg-error-bg text-error',
};

export const STATUS_BADGE_DARK_CLASSES: Record<string, string> = {
  pending: 'bg-[#FFF0D4]/15 text-[#FFD07A]',
  reviewing: 'bg-[#DDE9F1]/15 text-[#7FC8E8]',
  approved: 'bg-success-bg/15 text-[#7ED0A0]',
  rejected: 'bg-error-bg/15 text-[#E88A70]',
  duplicate: 'bg-[#E1EBE6]/15 text-[#B8C4BE]',
  available: 'bg-success-bg/15 text-[#7ED0A0]',
  unavailable: 'bg-[#E1EBE6]/15 text-[#B8C4BE]',
  rented: 'bg-[#DDE9F1]/15 text-[#7FC8E8]',
  expired: 'bg-error-bg/15 text-[#E88A70]',
  scheduled: 'bg-[#DDE9F1]/15 text-[#7FC8E8]',
  completed: 'bg-success-bg/15 text-[#7ED0A0]',
  cancelled: 'bg-error-bg/15 text-[#E88A70]',
};

export interface DashboardSnapshot {
  stats: Stats;
  leads: Lead[];
  units: Unit[];
  viewings: Viewing[];
}

/** Build the dashboard snapshot (stats + trimmed lists) that the admin
 *  accommodation dashboard seeds from. Shared between the server page
 *  (initial render) and the client dashboard (refetch after actions). */
export function buildDashboardSnapshot(
  leads: Lead[],
  properties: PropertyWithUnits[],
  viewings: Viewing[],
): DashboardSnapshot {
  const allUnits: Unit[] = properties.flatMap(p =>
    (p.units || []).map(u => ({
      ...u,
      property: { id: p.id, name: p.name, area: p.area },
    })),
  );

  const soonThreshold = new Date();
  soonThreshold.setDate(soonThreshold.getDate() + 3);

  const stats: Stats = {
    pending_leads: leads.filter(l => l.status === 'pending').length,
    reviewing_leads: leads.filter(l => l.status === 'reviewing').length,
    active_listings: allUnits.filter(u => u.availability_status === 'available').length,
    expiring_soon: allUnits.filter(
      u => u.verification_due_at && new Date(u.verification_due_at) <= soonThreshold,
    ).length,
    pending_viewings: viewings.filter(v => v.status === 'pending').length,
    scheduled_viewings: viewings.filter(v => v.status === 'scheduled').length,
  };

  return {
    stats,
    leads: leads.slice(0, 5),
    units: allUnits,
    viewings: viewings.slice(0, 5),
  };
}