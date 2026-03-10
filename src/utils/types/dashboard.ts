export type DashboardWelcomeHeaderProps = {
  fullName?: string | null;
};

export type DashboardQuickStatsProps = {
  currentGPA: number | null;
  materialsCount: number;
  vendorsCount: number;
  dailyDownloadCount: number;
};

export type Announcement = {
  id: string;
  title: string;
  type: string;
  created_at: string;
};

export type DashboardRecentAnnouncementsProps = {
  announcements: Announcement[];
};

export type Profile = {
  full_name?: string | null;
  level?: string | number | null;
  matric_number?: string | null;
  daily_download_count?: number | null;
};

export type DashboardProfileSectionProps = {
  profile: Profile | null;
  hasActiveSubscription: boolean;
  currentGPA: number | null;
};
