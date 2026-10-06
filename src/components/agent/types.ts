export const AGENT_STATUSES = [
  'pending_review',
  'approved',
  'more_information_required',
  'rejected',
  'suspended',
  'deactivated',
] as const;

export type AgentStatus = (typeof AGENT_STATUSES)[number];

export function isAgentStatus(value: string): value is AgentStatus {
  return (AGENT_STATUSES as readonly string[]).includes(value);
}

/** The agent's own application — fields returned by GET /api/agent/profile. */
export interface AgentProfile {
  id: string;
  display_name: string;
  phone_number: string;
  operating_area: string;
  status: string;
  submitted_at: string;
  reviewed_at: string | null;
  agent_feedback: string | null;
  total_properties_submitted: number;
  total_properties_approved: number;
  total_transactions: number;
}

/** The richer admin-facing row — adds user_id, review_note and created_at. */
export interface AdminAgent extends AgentProfile {
  user_id: string;
  bio: string | null;
  id_type: string | null;
  review_note: string | null;
  created_at: string;
}

export interface AgentSubmission {
  id: string;
  property_name: string;
  area: string;
  room_type: string;
  status: string;
  created_at: string;
}

export interface AgentAuditEvent {
  id: string;
  event_type: string;
  entity_type: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AgentDetailSnapshot {
  agent: AdminAgent;
  recent_submissions: AgentSubmission[];
  audit_events: AgentAuditEvent[];
}

export interface AgentsListResult {
  agents: AgentProfile[];
  total: number;
}