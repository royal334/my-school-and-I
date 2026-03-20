import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AppearanceSettings from "@/components/settings/appearance-settings";
import NotificationSettings from "@/components/settings/notification-settings";
import PrivacySettings from "@/components/settings/privacy-settings";
import PreferencesSettings from "@/components/settings/preferences-settings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import ComingSoonOverlay from "@/components/settings/coming-soon-overlay";

export const metadata = {
  title: "Settings | UniHub",
};

export default async function SettingsPage() {
  const supabase = createClient(await cookies());

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Manage your preferences and customize your experience
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        <AppearanceSettings />

        <ComingSoonOverlay>
          <NotificationSettings />
        </ComingSoonOverlay>

        <ComingSoonOverlay>
          <PrivacySettings />
        </ComingSoonOverlay>

        <ComingSoonOverlay>
          <PreferencesSettings />
        </ComingSoonOverlay>
      </div>
    </div>
  );
}
