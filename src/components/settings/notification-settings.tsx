'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  BellRing,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Loader2,
  RefreshCw,
  Send,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  collectPushDiagnostics,
  forceTokenSync,
  isPushSupported,
  isPushPermissionGranted,
  requestNotificationPermission,
  type PushDiagnostics,
} from '@/utils/lib/notifications';

interface Preferences {
  announcement_notifications: boolean;
  vendor_notifications: boolean;
}

const defaults: Preferences = {
  announcement_notifications: true,
  vendor_notifications: true,
};

type PermissionState = 'unsupported' | 'denied' | 'default' | 'granted';

function getPermissionState(): PermissionState {
  if (!isPushSupported()) return 'unsupported';
  return Notification.permission as PermissionState;
}

function DiagnosticRow({ label, ok, detail }: { label: string; ok: boolean; detail?: string }) {
  return (
    <div className="flex items-start gap-2 text-xs">
      {ok ? (
        <CircleCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
      ) : (
        <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
      )}
      <div className="min-w-0">
        <span className="font-medium">{label}</span>
        {detail ? <p className="break-all text-muted-foreground">{detail}</p> : null}
      </div>
    </div>
  );
}

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>(getPermissionState);
  const [enabling, setEnabling] = useState(false);
  const [diagnostics, setDiagnostics] = useState<PushDiagnostics | null>(null);
  const [diagnosticsOpen, setDiagnosticsOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [testing, setTesting] = useState(false);

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

  async function handleEnableNotifications() {
    if (enabling) return;
    setEnabling(true);
    try {
      const token = await requestNotificationPermission();
      if (!token) {
        toast.error('Notification permission was denied');
        setPermission(getPermissionState());
        return;
      }

      const tokenResponse = await fetch('/api/notifications/register-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (!tokenResponse.ok) throw new Error('Failed to register this device');

      await fetch('/api/notifications/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ announcement_notifications: true, vendor_notifications: true }),
      });

      setPreferences({ announcement_notifications: true, vendor_notifications: true });
      setPermission('granted');
      toast.success('Notifications enabled');
    } catch {
      toast.error('Failed to enable notifications');
    } finally {
      setEnabling(false);
    }
  }

  const runDiagnostics = useCallback(async () => {
    setChecking(true);
    try {
      setDiagnostics(await collectPushDiagnostics());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Diagnostics failed');
    } finally {
      setChecking(false);
    }
  }, []);

  async function handleReRegisterDevice() {
    if (syncing) return;
    setSyncing(true);
    try {
      const token = await forceTokenSync();
      if (!token) {
        toast.error('Could not obtain a token. Check permission and the service worker.');
        return;
      }
      toast.success('Device token re-registered');
      await runDiagnostics();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Re-registration failed');
    } finally {
      setSyncing(false);
    }
  }

  async function handleTestPush() {
    if (testing) return;
    setTesting(true);
    try {
      const response = await fetch('/api/notifications/test-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        toast.error(result?.error || `Test push failed (${response.status})`);
        return;
      }

      if (result.success) {
        toast.success(`FCM accepted ${result.tokensAccepted}/${result.tokensRegistered} token(s)`);
      } else {
        toast.error(result.hint || 'FCM rejected every token');
      }

      console.log('Test push result:', result);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Test push failed');
    } finally {
      setTesting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-accent-600 dark:text-accent-400" />
          <h2 className="text-xl font-semibold">Notifications</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose which updates you want to receive
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === 'unsupported' && (
          <p className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            Push notifications are not supported in this browser. On iPhone or iPad, install Campus&Me to your Home Screen to enable them.
          </p>
        )}

        {permission !== 'unsupported' && permission !== 'granted' && (
          <div className="flex items-center justify-between rounded-lg border border-warning/40 bg-warning-bg p-4 dark:border-warning/30 dark:bg-warning/10">
            <div className="flex items-center gap-3">
              <BellRing className="h-5 w-5 text-warning" />
              <div>
                <p className="text-sm font-medium">Push notifications are off</p>
                <p className="text-xs text-muted-foreground">
                  {permission === 'denied'
                    ? 'Permission was blocked. Please enable them in your browser settings.'
                    : 'Enable them to receive announcements and updates.'}
                </p>
              </div>
            </div>
            {permission !== 'denied' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleEnableNotifications}
                disabled={enabling}
              >
                {enabling ? 'Enabling…' : 'Enable'}
              </Button>
            )}
          </div>
        )}

        {permission === 'granted' && (
          <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success-bg p-3 text-sm text-success-text dark:border-success/30 dark:bg-success/10">
            <Check className="h-4 w-4" />
            Push notifications are enabled
          </div>
        )}

        <div className="rounded-lg border">
          <button
            type="button"
            onClick={() => setDiagnosticsOpen((open) => !open)}
            className="flex w-full items-center justify-between p-3 text-left text-sm font-medium transition-colors hover:bg-muted/50"
          >
            Push diagnostics
            {diagnosticsOpen ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {diagnosticsOpen && (
            <div className="space-y-3 border-t p-3">
              <p className="text-xs text-muted-foreground">
                The notification panel is a database record and proves nothing about push. These
                checks isolate the service worker, the FCM token and the send pipeline.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void runDiagnostics()}
                  disabled={checking}
                >
                  {checking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  Run checks
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleReRegisterDevice()}
                  disabled={syncing || !isPushPermissionGranted()}
                >
                  {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <BellRing className="h-3.5 w-3.5" />}
                  Re-register device
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => void handleTestPush()}
                  disabled={testing}
                >
                  {testing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                  Send test push
                </Button>
              </div>

              {diagnostics && (
                <div className="space-y-2">
                  <DiagnosticRow
                    label={`Browser support: ${diagnostics.supported ? 'available' : 'unavailable'}`}
                    ok={diagnostics.supported}
                  />
                  <DiagnosticRow
                    label={`Permission: ${diagnostics.permission}`}
                    ok={diagnostics.permission === 'granted'}
                  />
                  <DiagnosticRow
                    label={`Firebase service worker: ${diagnostics.firebaseSwActive ? 'active' : 'inactive'}`}
                    ok={diagnostics.firebaseSwActive}
                    detail={diagnostics.firebaseSwScope ?? undefined}
                  />
                  <DiagnosticRow
                    label={`PushManager subscription: ${diagnostics.pushSubscription ? 'present' : 'missing'}`}
                    ok={Boolean(diagnostics.pushSubscription)}
                    detail={diagnostics.pushSubscription?.endpoint.slice(0, 60)}
                  />
                  <DiagnosticRow
                    label={`FCM token: ${diagnostics.currentToken ? 'obtained' : 'unavailable'}`}
                    ok={Boolean(diagnostics.currentToken)}
                    detail={diagnostics.currentToken ? `${diagnostics.currentToken.slice(0, 24)}...` : undefined}
                  />
                  <DiagnosticRow
                    label={`Token matches the one stored on the server: ${diagnostics.tokenInSync ? 'yes' : 'no'}`}
                    ok={diagnostics.tokenInSync}
                    detail={diagnostics.tokenInSync ? undefined : 'A stale token fails silently. Use Re-register device.'}
                  />
                  {diagnostics.error && (
                    <div className="flex items-start gap-2 text-xs text-destructive">
                      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span className="break-all">{diagnostics.error}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-md border bg-muted/50 p-3 text-xs text-muted-foreground">
                <p className="mb-1 font-medium text-foreground">Before you test</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>Background or close the tab. A focused tab shows a toast and no system popup.</li>
                  <li>iPhone: iOS only delivers Web Push to a Home Screen PWA launched from its icon.</li>
                  <li>Windows Focus Assist and per-site Chrome blocks hide popups while permission still reads granted.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-announcements">Announcements</Label>
            <p className="text-sm text-muted-foreground">
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
            <p className="text-sm text-muted-foreground">
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
