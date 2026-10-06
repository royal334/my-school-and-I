import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Card } from '@/components/admin/accommodation/card';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { InfoRow } from '@/components/admin/accommodation/info-row';
import type { AdminAgent } from '@/components/agent/types';

export function AgentProfileCard({
  agent,
  idDocumentUrl,
}: {
  agent: AdminAgent;
  idDocumentUrl: string | null;
}) {
  return (
    <Card>
      <SectionTitle>Profile</SectionTitle>
      <InfoRow label="Name / Agency" value={agent.display_name} />
      <InfoRow label="Phone" value={agent.phone_number} />
      <InfoRow label="Operating areas" value={agent.operating_area} />
      <InfoRow label="ID type submitted" value={agent.id_type ?? 'Not provided'} />
      {idDocumentUrl && (
        <Button asChild variant="outline" size="sm" className="mt-2">
          <Link href={idDocumentUrl} target="_blank" rel="noreferrer">
            View identity document
          </Link>
        </Button>
      )}
      <InfoRow label="Applied" value={format(new Date(agent.submitted_at), 'MMM d, yyyy')} />
      {agent.reviewed_at && (
        <InfoRow label="Reviewed" value={format(new Date(agent.reviewed_at), 'MMM d, yyyy')} />
      )}

      {agent.bio && (
        <div className="mt-3 border-t border-border/70 pt-3">
          <p className="mb-1 text-xs text-muted-foreground">Bio</p>
          <p className="text-[13px] leading-relaxed text-foreground">{agent.bio}</p>
        </div>
      )}
    </Card>
  );
}