export type Tab = 'overview' | 'leads' | 'listings' | 'viewings';

// ─── List rows ───────────────────────────────────────────────────────────────

export interface Lead {
  id: string;
  property_name: string;
  area: string;
  room_type: string;
  status: string;
  created_at: string;
  submitter: { full_name: string | null } | null;
}

export interface Unit {
  id: string;
  unit_number: string | null;
  room_type: string;
  price: number | null;
  availability_status: string;
  last_verified_at: string | null;
  verification_due_at: string | null;
  property: { id: string; name: string; area: string };
}

export interface PropertyWithUnits {
  id: string;
  name: string;
  area: string;
  units: Omit<Unit, 'property'>[];
}

export interface Viewing {
  id: string;
  student_name: string;
  student_phone: string;
  status: string;
  preferred_date: string | null;
  preferred_time: string | null;
  created_at: string;
  unit: {
    unit_number: string | null;
    room_type: string;
    property: { name: string; area: string };
  };
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface Stats {
  pending_leads: number;
  reviewing_leads: number;
  active_listings: number;
  expiring_soon: number;
  pending_viewings: number;
  scheduled_viewings: number;
}

export interface DashboardSnapshot {
  stats: Stats;
  leads: Lead[];
  units: Unit[];
  viewings: Viewing[];
  initialTab: Tab;
}

// ─── Lead detail ─────────────────────────────────────────────────────────────

export interface LeadSubmitter {
  id: string;
  full_name: string | null;
}

export interface LeadMedia {
  id: string;
  file_path: string;
  file_type: string;
}

export interface MatchedProperty {
  id: string;
  name: string;
  area: string;
}

export interface MatchedUnit {
  id: string;
  unit_number: string | null;
  room_type: string;
}

export interface LeadDetail {
  id: string;
  property_name: string;
  area: string;
  street: string | null;
  landmark: string | null;
  unit_number: string | null;
  room_type: string;
  expected_price: number | null;
  available_from: string | null;
  additional_charges_note: string | null;
  landlord_name: string | null;
  landlord_phone: string | null;
  submitter_relationship: string | null;
  has_water: boolean | null;
  has_electricity: boolean | null;
  has_security: boolean | null;
  facilities_notes: string | null;
  other_notes: string | null;
  status: string;
  admin_notes: string | null;
  submitted_by: string;
  created_at: string;
  updated_at?: string | null;
  submitter: LeadSubmitter | null;
  matched_property: MatchedProperty | null;
  matched_unit: MatchedUnit | null;
  media: LeadMedia[];
}

export type LeadAction =
  | 'reviewing'
  | 'create_property'
  | 'duplicate'
  | 'rejected';

// ─── Viewing detail ──────────────────────────────────────────────────────────

export interface ViewingProperty {
  id: string;
  name: string;
  area: string;
  landlord_name?: string | null;
  landlord_phone: string | null;
  caretaker_name?: string | null;
  caretaker_phone: string | null;
}

export interface ViewingUnit {
  id: string;
  unit_number: string | null;
  room_type: string;
  price: number | null;
  property: ViewingProperty;
}

export interface ViewingDetail {
  id: string;
  student_id: string;
  student_name: string;
  student_phone: string;
  preferred_date: string | null;
  preferred_time: string | null;
  message: string | null;
  status: string;
  scheduled_date: string | null;
  admin_notes: string | null;
  created_at: string;
  unit: ViewingUnit;
}

export type ViewingAction = 'schedule' | 'transaction';

export function isTab(value: string | undefined): value is Tab {
  return value === 'overview' || value === 'leads' || value === 'listings' || value === 'viewings';
}