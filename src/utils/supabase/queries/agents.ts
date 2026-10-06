import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AdminAgent,
  AgentAuditEvent,
  AgentDetailSnapshot,
  AgentProfile,
  AgentsListResult,
  AgentSubmission,
} from '@/components/agent/types';

const PROFILE_COLUMNS =
  'id, display_name, phone_number, operating_area, status, submitted_at, reviewed_at, agent_feedback, total_properties_submitted, total_properties_approved, total_transactions';

const ADMIN_COLUMNS = `${PROFILE_COLUMNS}, user_id, bio, id_type, review_note, created_at`;

/** The signed-in user's own agent application, or null if they never applied. */
export async function getAgentProfile(
  supabase: SupabaseClient,
  userId: string,
): Promise<AgentProfile | null> {
  const { data, error } = await supabase
    .from('agents')
    .select(PROFILE_COLUMNS)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return (data as AgentProfile | null) ?? null;
}

/** Admin agent list, newest application first. */
export async function getAgents(
  supabase: SupabaseClient,
  status: string,
  limit: number,
): Promise<AgentsListResult> {
  let query = supabase
    .from('agents')
    .select(PROFILE_COLUMNS, { count: 'exact' })
    .order('submitted_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    agents: (data ?? []) as AgentProfile[],
    total: count ?? 0,
  };
}

/** A single agent application with their recent submissions and audit trail. */
export async function getAgentDetail(
  supabase: SupabaseClient,
  id: string,
): Promise<AgentDetailSnapshot | null> {
  const { data: agent, error } = await supabase
    .from('agents')
    .select(ADMIN_COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!agent) return null;

  const [{ data: submissions }, { data: auditEvents }] = await Promise.all([
    supabase
      .from('accommodation_submissions')
      .select('id, property_name, area, room_type, status, created_at')
      .eq('agent_id', agent.user_id)
      .eq('source_type', 'agent')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('agent_audit_events')
      .select('id, event_type, entity_type, metadata, created_at')
      .eq('agent_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
  ]);

  return {
    agent: agent as AdminAgent,
    recent_submissions: (submissions ?? []) as AgentSubmission[],
    audit_events: (auditEvents ?? []) as AgentAuditEvent[],
  };
}