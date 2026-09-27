import type { SupabaseClient } from '@supabase/supabase-js';
import { buildDashboardSnapshot, type DashboardSnapshot } from '@/components/admin/accommodation/utils';
import type {
  Lead,
  LeadDetail,
  PropertyWithUnits,
  Viewing,
  ViewingDetail,
} from '@/components/admin/accommodation/types';

export async function getAdminAccommodationDashboard(
  supabase: SupabaseClient,
): Promise<DashboardSnapshot> {
  const [{ data: leadRows }, { data: properties }, { data: viewingRows }] = await Promise.all([
    supabase
      .from('accommodation_submissions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('accommodation_properties')
      .select(
        'id, name, area, units:accommodation_units (id, unit_number, room_type, price, availability_status, last_verified_at, verification_due_at, created_at)',
      )
      .order('created_at', { ascending: true }),
    supabase
      .from('accommodation_viewings')
      .select(
        '*, unit:accommodation_units (id, unit_number, room_type, price, property:accommodation_properties (id, name, area))',
      )
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  const unitIds = (properties ?? []).flatMap(property =>
    (property.units ?? []).map((unit: { id: string }) => unit.id),
  );
  const submissionCreatedAtByUnitId = new Map<string, string>();
  if (unitIds.length > 0) {
    const { data: linkedSubmissions } = await supabase
      .from('accommodation_submissions')
      .select('matched_unit_id, created_at')
      .in('matched_unit_id', unitIds)
      .order('created_at', { ascending: true });

    for (const submission of linkedSubmissions ?? []) {
      if (submission.matched_unit_id && !submissionCreatedAtByUnitId.has(submission.matched_unit_id)) {
        submissionCreatedAtByUnitId.set(submission.matched_unit_id, submission.created_at);
      }
    }
  }

  const propertiesWithSubmissionDates = (properties ?? []).map(property => ({
    ...property,
    units: (property.units ?? []).map((unit: { id: string }) => ({
      ...unit,
      submission_created_at: submissionCreatedAtByUnitId.get(unit.id) ?? null,
    })),
  }));

  const leads = leadRows ?? [];
  const submitterIds = Array.from(
    new Set(leads.map(l => l.submitted_by).filter((id): id is string => Boolean(id))),
  );

  let submittersById = new Map<string, { full_name: string | null }>();
  if (submitterIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', submitterIds);
    submittersById = new Map((profiles || []).map(p => [p.id, p]));
  }

  const enrichedLeads: Lead[] = leads.map(l => ({
    ...l,
    submitter: l.submitted_by ? (submittersById.get(l.submitted_by) ?? null) : null,
  }));

  return buildDashboardSnapshot(
    enrichedLeads,
    propertiesWithSubmissionDates as PropertyWithUnits[],
    (viewingRows ?? []) as Viewing[],
  );
}

export async function getLeadDetail(
  supabase: SupabaseClient,
  id: string,
): Promise<LeadDetail | null> {
  const { data: lead, error } = await supabase
    .from('accommodation_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !lead) return null;

  let submitter = null;
  if (lead.submitted_by) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, full_name, phone_number')
      .eq('id', lead.submitted_by)
      .maybeSingle();
    submitter = profile;
  }

  let matched_property = null;
  if (lead.matched_property_id) {
    const { data: property } = await supabase
      .from('accommodation_properties')
      .select('id, name, area')
      .eq('id', lead.matched_property_id)
      .maybeSingle();
    matched_property = property;
  }

  let matched_unit = null;
  if (lead.matched_unit_id) {
    const { data: unit } = await supabase
      .from('accommodation_units')
      .select('id, unit_number, room_type')
      .eq('id', lead.matched_unit_id)
      .maybeSingle();
    matched_unit = unit;
  }

  const { data: media } = await supabase
    .from('accommodation_media')
    .select('*')
    .eq('submission_id', id);

  return {
    ...lead,
    submitter,
    matched_property,
    matched_unit,
    media: media || [],
  } as LeadDetail;
}

export async function getViewingDetail(
  supabase: SupabaseClient,
  id: string,
): Promise<ViewingDetail | null> {
  const { data: viewing, error } = await supabase
    .from('accommodation_viewings')
    .select(
      `*,
      unit:accommodation_units (
        id, unit_number, room_type, price,
        property:accommodation_properties (
          id, name, area, landlord_name, landlord_phone, caretaker_name, caretaker_phone
        )
      )`,
    )
    .eq('id', id)
    .maybeSingle();

  if (error || !viewing) return null;

  return viewing as ViewingDetail;
}