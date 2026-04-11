import {
  DashboardWelcomeHeader,
  DashboardSubscriptionBanner,
  DashboardQuickStats,
  DashboardQuickActions,
  DashboardRecentAnnouncements,
  DashboardProfileSection,
} from './index';

interface StudentDashboardProps {
  profile: any;
  materialsCount: number;
  vendorsCount: number;
  currentGPA: number | null;
  announcements: any[];
  hasActiveSubscription: boolean;
}

export function StudentDashboard({
  profile,
  materialsCount,
  vendorsCount,
  currentGPA,
  announcements,
  hasActiveSubscription,
}: StudentDashboardProps) {
  return (
    <div className="space-y-6">
      <DashboardWelcomeHeader fullName={profile?.full_name} />

      {!hasActiveSubscription && <DashboardSubscriptionBanner />}

      <DashboardQuickStats
        currentGPA={currentGPA}
        materialsCount={materialsCount || 0}
        vendorsCount={vendorsCount || 0}
        dailyDownloadCount={profile?.daily_download_count || 0}
      />

      <DashboardQuickActions />

      <DashboardRecentAnnouncements announcements={announcements || []} />

      <DashboardProfileSection
        profile={profile}
        hasActiveSubscription={hasActiveSubscription}
        currentGPA={currentGPA}
      />
    </div>
  );
}
