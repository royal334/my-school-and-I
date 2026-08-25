'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { requestNotificationPermission } from '@/utils/lib/notifications';

interface Preferences {
  announcement_notifications: boolean;
  vendor_notifications: boolean;
}

const defaults: Preferences = {
  announcement_notifications: true,
  vendor_notifications: true,
};

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load notification preferences');
        return response.json();
      })
      .then((data) => {
        setPreferences((current) => ({
          ...current,
          announcement_notifications:
            data.preferences.announcement_notifications ?? current.announcement_notifications,
          vendor_notifications:
            data.preferences.vendor_notifications ?? current.vendor_notifications,
        }));
      })
      .catch((error) => toast.error(error.message))
      .finally(() => setLoading(false));
  }, []);

  async function updatePreference(key: keyof Preferences, value: boolean) {
    const previous = preferences[key];
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaving(key);

    try {
      if (value && key === 'announcement_notifications') {
        const token = await requestNotificationPermission();
        if (!token) throw new Error('Notifications were not granted');

        const tokenResponse = await fetch('/api/notifications/register-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });
        if (!tokenResponse.ok) throw new Error('Failed to register this device');
      }

      const response = await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: value }),
      });
      if (!response.ok) throw new Error('Failed to save notification preference');
      toast.success('Notification preference updated');
    } catch (error) {
      setPreferences((current) => ({ ...current, [key]: previous }));
      toast.error(error instanceof Error ? error.message : 'Failed to update preference');
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Choose which updates you want to receive
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-announcements">Announcements</Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Receive academic and departmental announcements
            </p>
          </div>
          <Switch
            id="push-announcements"
            checked={preferences.announcement_notifications}
            disabled={loading || saving !== null}
            onCheckedChange={(value) => {
              void updatePreference('announcement_notifications', value);
            }}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-vendors">Vendor updates</Label>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Receive updates from approved vendors
            </p>
          </div>
          <Switch
            id="push-vendors"
            checked={preferences.vendor_notifications}
            disabled={loading || saving !== null}
            onCheckedChange={(value) => {
              void updatePreference('vendor_notifications', value);
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
