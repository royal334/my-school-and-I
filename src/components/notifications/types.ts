export type NotificationType = 'all' | 'announcement' | 'vendor' | 'marketplace' | 'accommodation' | 'platform';
export type FilterMode = 'all' | 'unread';

export interface Notification {
  id: string;
  user_id: string;
  notification_type_id: string | null;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  notification_type?: {
    type_key: string;
  } | null;
}

export interface NotificationFilters {
  type: NotificationType;
  searchQuery: string;
  filterMode: FilterMode;
}
