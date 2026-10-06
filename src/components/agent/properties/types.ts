export interface SubmissionMedia {
  id: string;
  file_path: string;
  file_type: string;
  is_cover: boolean;
  display_order: number;
  url?: string | null;
}

export interface Submission {
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
  has_water: boolean | null;
  has_electricity: boolean | null;
  has_security: boolean | null;
  facilities_notes: string | null;
  other_notes: string | null;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  matched_unit_id: string | null;
  matched_property_id: string | null;
  cover_image?: { file_path: string; url?: string | null } | null;
  media?: SubmissionMedia[];
}

export const STATUS_CONFIG: Record<string, {
  label: string;
  color: string;
  bg: string;
  border: string;
  desc: string;
}> = {
  pending: {
    label: "Pending review",
    color: "text-warning-text",
    bg: "bg-warning-bg",
    border: "border-warning/25",
    desc: "Our team will review and contact the landlord.",
  },
  reviewing: {
    label: "Under review",
    color: "text-info-text",
    bg: "bg-info-bg",
    border: "border-info/25",
    desc: "Our team is verifying this property.",
  },
  correction_required: {
    label: "Correction required",
    color: "text-error-text",
    bg: "bg-error-bg",
    border: "border-error/25",
    desc: "Please update your submission based on admin feedback.",
  },
  approved: {
    label: "Approved & live",
    color: "text-success-text",
    bg: "bg-success-bg",
    border: "border-success/25",
    desc: "This property is verified and visible to students.",
  },
  rejected: {
    label: "Rejected",
    color: "text-error-text",
    bg: "bg-error-bg",
    border: "border-error/25",
    desc: "This submission was not approved.",
  },
  duplicate: {
    label: "Duplicate",
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
    desc: "This property was already submitted.",
  },
};

export const FILTERS = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "reviewing", label: "Reviewing" },
  { key: "correction_required", label: "Needs update" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export const ROOM_TYPES = [
  "Self-contained",
  "Single room",
  "Shared room/Roommate Space",
  "1-bedroom",
  "2-bedroom",
  "Other",
];
