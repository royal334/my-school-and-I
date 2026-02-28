import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Profile = {
  full_name?: string | null;
  level?: string | number | null;
  matric_number?: string | null;
  daily_download_count?: number | null;
};

type DashboardProfileSectionProps = {
  profile: Profile | null;
  hasActiveSubscription: boolean;
  currentGPA: number | null;
};

export function DashboardProfileSection({
  profile,
  hasActiveSubscription,
  currentGPA,
}: DashboardProfileSectionProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Your Profile</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Level</span>
            <Badge className="bg-primary-100 text-primary-700">
              {profile?.level} Level
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Matric Number</span>
            <span className="text-sm font-medium text-slate-900">
              {profile?.matric_number}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Status</span>
            <Badge
              className={
                hasActiveSubscription
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-700'
              }
            >
              {hasActiveSubscription ? 'Premium' : 'Free'}
            </Badge>
          </div>
          <Link href="/dashboard/profile">
            <Button variant="outline" className="mt-4 w-full">
              Edit Profile
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Getting Started</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-xs text-green-700">
                ✓
              </div>
              <span className="text-sm text-slate-600">
                Complete your profile
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-700">
                {currentGPA ? '✓' : '1'}
              </div>
              <span className="text-sm text-slate-600">
                Add your first semester
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700">
                2
              </div>
              <span className="text-sm text-slate-600">
                Browse study materials
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-700">
                3
              </div>
              <span className="text-sm text-slate-600">
                Connect with vendors
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

