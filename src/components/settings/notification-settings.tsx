'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    emailNewMaterials: true,
    emailAnnouncements: true,
    emailGradeUpdates: false,
    emailSubscription: true,
    pushNewMaterials: false,
    pushAnnouncements: true,
  });

  const handleToggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success('Notification preference updated');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose what notifications you want to receive
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Notifications */}
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            Email Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-materials">New Materials</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when new study materials are uploaded
                </p>
              </div>
              <Switch
                id="email-materials"
                checked={settings.emailNewMaterials}
                onCheckedChange={() => handleToggle('emailNewMaterials')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-announcements">Announcements</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Receive important departmental announcements
                </p>
              </div>
              <Switch
                id="email-announcements"
                checked={settings.emailAnnouncements}
                onCheckedChange={() => handleToggle('emailAnnouncements')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-grades">Grade Updates</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Updates about your CGPA and semester results
                </p>
              </div>
              <Switch
                id="email-grades"
                checked={settings.emailGradeUpdates}
                onCheckedChange={() => handleToggle('emailGradeUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-subscription">Subscription Updates</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Payment confirmations and subscription reminders
                </p>
              </div>
              <Switch
                id="email-subscription"
                checked={settings.emailSubscription}
                onCheckedChange={() => handleToggle('emailSubscription')}
              />
            </div>
          </div>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <h3 className="font-medium text-slate-900 dark:text-slate-100">
            Push Notifications
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-materials">New Materials</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Browser notifications for new uploads
                </p>
              </div>
              <Switch
                id="push-materials"
                checked={settings.pushNewMaterials}
                onCheckedChange={() => handleToggle('pushNewMaterials')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-announcements">Announcements</Label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Instant notifications for urgent updates
                </p>
              </div>
              <Switch
                id="push-announcements"
                checked={settings.pushAnnouncements}
                onCheckedChange={() => handleToggle('pushAnnouncements')}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}