'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export default function PrivacySettings() {
  const [settings, setSettings] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    activityTracking: true,
    dataAnalytics: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Privacy setting updated');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          <h2 className="text-xl font-semibold">Privacy & Security</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Control your privacy and data sharing preferences
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Profile Visibility */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            Profile Visibility
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="profile-visible">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow other students to see your profile
                </p>
              </div>
              <Switch
                id="profile-visible"
                checked={settings.profileVisible}
                onCheckedChange={() => handleToggle('profileVisible')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-email">Show Email</Label>
                <p className="text-sm text-muted-foreground">
                  Display email on your public profile
                </p>
              </div>
              <Switch
                id="show-email"
                checked={settings.showEmail}
                onCheckedChange={() => handleToggle('showEmail')}
                disabled={!settings.profileVisible}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="show-phone">Show Phone Number</Label>
                <p className="text-sm text-muted-foreground">
                  Display phone number on your public profile
                </p>
              </div>
              <Switch
                id="show-phone"
                checked={settings.showPhone}
                onCheckedChange={() => handleToggle('showPhone')}
                disabled={!settings.profileVisible}
              />
            </div>
          </div>
        </div>

        {/* Data & Analytics */}
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">
            Data & Analytics
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="activity-tracking">Activity Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track downloads and materials viewed
                </p>
              </div>
              <Switch
                id="activity-tracking"
                checked={settings.activityTracking}
                onCheckedChange={() => handleToggle('activityTracking')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="data-analytics">Usage Analytics</Label>
                <p className="text-sm text-muted-foreground">
                  Help improve CampusHub with anonymous usage data
                </p>
              </div>
              <Switch
                id="data-analytics"
                checked={settings.dataAnalytics}
                onCheckedChange={() => handleToggle('dataAnalytics')}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <h4 className="font-medium text-destructive">
            Danger Zone
          </h4>
          <p className="mt-1 text-sm text-destructive/80">
            Permanently delete your account and all associated data
          </p>
          <button className="mt-3 text-sm font-medium text-destructive hover:text-destructive/80">
            Delete Account
          </button>
        </div>
      </CardContent>
    </Card>
  );
}