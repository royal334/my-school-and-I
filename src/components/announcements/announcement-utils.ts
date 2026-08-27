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
      return 'bg-[#FDEAE5] text-[#C44B2A] border-[#E88A78]';
    case 'important':
      return 'bg-[#FFF0D4] text-[#9E6A08] border-[#FFD07A]';
    default:
      return 'bg-[#E8F5EF] text-[#3A7260] border-[#A8D8C2]';
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
