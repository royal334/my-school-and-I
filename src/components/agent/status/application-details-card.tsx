"use client"
import { format } from 'date-fns';
import type { AgentProfile } from '../types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import axios from 'axios';


function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 py-2 last:border-b-0">
      <span className="shrink-0 text-xs text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] text-foreground">{value}</span>
    </div>
  );
}



export function ApplicationDetailsCard({ agent }: { agent: AgentProfile }) {
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      const response = await axios.post("/api/auth/logout");
      router.push(response.status === 200 ? "/" : "/login");
    } catch {
      router.push("/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-primary-600 dark:text-primary-300">
        Your application
      </p>

      <InfoRow label="Name / Agency" value={agent.display_name} />
      <InfoRow label="Phone" value={agent.phone_number} />
      <InfoRow label="Operating areas" value={agent.operating_area} />
      <InfoRow label="Applied" value={format(new Date(agent.submitted_at), 'd MMMM yyyy')} />
      <InfoRow
        label="Reviewed"
        value={agent.reviewed_at ? format(new Date(agent.reviewed_at), 'd MMMM yyyy') : 'Pending'}
      />
      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-4 w-full rounded-lg bg-error px-3.5 py-2 text-sm text-white font-medium text-error-foreground transition-colors hover:bg-error/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loggingOut ? 'Logging Out' : 'Log out'}
      </button>
    </section>
  );
}