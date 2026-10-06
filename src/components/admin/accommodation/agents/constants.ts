export const AGENT_FILTERS = [
  { key: 'pending_review', label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'more_information_required', label: 'More info' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'suspended', label: 'Suspended' },
  { key: '', label: 'All' },
] as const;

export type AgentFilterKey = (typeof AGENT_FILTERS)[number]['key'];

export function isAgentFilterKey(value: string): value is AgentFilterKey {
  return AGENT_FILTERS.some(f => f.key === value);
}

export function getFilterLabel(key: string): string {
  return AGENT_FILTERS.find(f => f.key === key)?.label.toLowerCase() ?? '';
}

export const AGENTS_PAGE_SIZE = 50;