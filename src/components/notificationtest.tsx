"use client";

import { useState } from "react";
import { toast } from "sonner";
import { requestNotificationPermission } from "@/utils/lib/notifications";

export default function NotificationTest() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  async function enableNotifications() {
    try {
      setStatus("loading");
      const token = await requestNotificationPermission();

      if (!token) {
        toast.error("Notification permission denied or not supported.", {
          position: "top-center",
        });
        setStatus("idle");
        return;
      }

      const res = await fetch("/api/notifications/register-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || "Failed to register token");
      }

      setStatus("done");
      toast.success("Notifications enabled!", { position: "top-center" });
    } catch (err) {
      console.error("Notification registration error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to enable notifications.", {
        position: "top-center",
      });
      setStatus("idle");
    }

  }

  return (
    <button
      onClick={enableNotifications}
      disabled={status === "loading" || status === "done"}
      className="text-sm border rounded-md px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
    >
      {status === "loading"
        ? "Enabling..."
        : status === "done"
          ? "Notifications Enabled"
          : "Enable Notifications"}
    </button>
  );
}
