import type { AgentAuditEvent } from '@/components/agent/types';
import type { LeadDetail } from '@/components/admin/accommodation/types';
import { LeadActionPanel } from './lead-action-panel';
import { LeadAgentCard } from './lead-agent-card';
import { LeadAuditTrail } from './lead-audit-trail';
import { LeadCorrectionNoteCard } from './lead-correction-note-card';
import { LeadDetailHeader } from './lead-detail-header';
import { LeadFacilitiesCard } from './lead-facilities-card';
import { LeadLinkedPropertyCard } from './lead-linked-property-card';
import { LeadMediaGallery } from './lead-media-gallery';
import { LeadOwnerCard } from './lead-owner-card';
import { LeadPropertyCard } from './lead-property-card';
import { LeadSubmitterCard } from './lead-submitter-card';
import { isAgentLead } from './lead-source-badge';

/** Server component: every card below renders on the server, and only the
 *  action panel and media gallery ship as client islands. Mutations call
 *  `router.refresh()`, so the cards re-render from fresh data. */
export function LeadDetailView({
  lead,
  auditEvents = [],
}: {
  lead: LeadDetail;
  auditEvents?: AgentAuditEvent[];
}) {
  const isAgent = isAgentLead(lead);

  return (
    <div className="min-h-screen bg-background pb-20">
      <LeadDetailHeader lead={lead} />

      <div className="flex flex-col gap-3 p-4">
        <LeadActionPanel lead={lead} isAgent={isAgent} />

        {isAgent && lead.agent_profile ? (
          <LeadAgentCard agent={lead.agent_profile} />
        ) : (
          <LeadSubmitterCard lead={lead} />
        )}

        {isAgent && lead.status === 'correction_required' && lead.admin_notes && (
          <LeadCorrectionNoteCard note={lead.admin_notes} />
        )}

        <LeadPropertyCard lead={lead} />

        <LeadOwnerCard lead={lead} />

        <LeadFacilitiesCard lead={lead} />

        <LeadMediaGallery media={lead.media} isAgent={isAgent} />

        <LeadLinkedPropertyCard lead={lead} />

        <LeadAuditTrail events={isAgent ? auditEvents : []} />
      </div>
    </div>
  );
}