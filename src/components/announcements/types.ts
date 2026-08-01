export type AnnouncementType = 'all' | 'academic' | 'official_school';
export type AnnouncementPriority = 'all' | 'normal' | 'important' | 'urgent';
export type FilterMode = 'all' | 'unread';

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'academic' | 'official_school';
  category: string;
  priority: 'normal' | 'important' | 'urgent';
  status?: 'draft' | 'published' | 'archived';
  published_at: string;
  expires_at?: string;
  is_read: boolean;
  sender_role?: string | null;
  author: { full_name: string; role: { role: string } | null };
  total_reads?: number;
}

export interface AnnouncementFilters {
  type: AnnouncementType;
  priority: AnnouncementPriority;
  searchQuery: string;
  filterMode: FilterMode;
}
