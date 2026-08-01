import type { Announcement } from './types';

const CATEGORY_ICONS: Record<string, string> = {
  exam: '📝',
  lecture: '🎓',
  assignment: '📋',
  event: '🎉',
  deadline: '⏰',
  policy: '📜',
};

const PRIORITY_ORDER: Record<Announcement['priority'], number> = {
  urgent: 0,
  important: 1,
  normal: 2,
};

export function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800 border-red-300';
    case 'important':
      return 'bg-orange-100 text-orange-800 border-orange-300';
    default:
      return 'bg-blue-100 text-blue-800 border-blue-300';
  }
}

export function getCategoryIcon(category: string) {
  return CATEGORY_ICONS[category] || '📢';
}

export function formatRoleLabel(role?: string | null) {
  return role?.replace(/_/g, ' ') || '';
}

export function sortAnnouncements(announcements: Announcement[]) {
  return [...announcements].sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];

    if (priorityDiff !== 0) return priorityDiff;

    return (
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  });
}
