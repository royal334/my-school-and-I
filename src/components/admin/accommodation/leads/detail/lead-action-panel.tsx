'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { SectionTitle } from '@/components/admin/accommodation/section-title';
import { createClient } from '@/utils/supabase/client';
import type { LeadAction, LeadDetail } from '@/components/admin/accommodation/types';
import {
  ACTION_TRIGGER_CLASS,
  AVAILABLE_ACTIONS,
  DANGER_BTN_CLASS,
  LEAD_ACTIONS,
  PRIMARY_BTN_CLASS,
  SECONDARY_BTN_CLASS,
  TEXTAREA_CLASS,
} from './constants';
import { LeadCard } from './lead-card';
import {
  LeadCreatePropertyForm,
  type CreatePropertyPayload,
} from './lead-create-property-form';

type StatusAction = Exclude<LeadAction, 'create_property'>;

const PATCH_PAYLOADS: Record<StatusAction, (adminNotes: string, correction: string) => Record<string, unknown>> = {
  reviewing: notes => ({ action: 'update_status', status: 'reviewing', admin_notes: notes }),
  correction: (_notes, correction) => ({
    action: 'request_correction',
    correction_message: correction,
  }),
  duplicate: notes => ({ action: 'mark_duplicate', admin_notes: notes }),
  rejected: notes => ({ action: 'update_status', status: 'rejected', admin_notes: notes }),
};

const SUCCESS_MESSAGES: Record<LeadAction, string> = {
  reviewing: 'Submission marked as reviewing.',
  correction: 'Correction request sent to the agent.',
  create_property: 'Property created, verified and listed.',
  duplicate: 'Submission marked as duplicate.',
  rejected: 'Submission rejected.',
};

async function readError(response: Response, fallback: string) {
  try {
    const data = await response.json();
    return data?.error ?? fallback;
  } catch {
    return fallback;
  }
}

/** Uploads the admin's new photos as the unit's verified media. Runs after the
 *  property + unit exist so the rows can be attached to the new unit. */
async function uploadVerifiedPhotos(unitId: string, propertyId: string, files: File[]) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop();
    const path = `listings/${unitId}/${Date.now()}_${i}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from('accommodation-media')
      .upload(path, file);
    if (upErr) throw new Error(`Failed to upload ${file.name}`);

    const { error: dbErr } = await supabase.from('accommodation_media').insert({
      unit_id: unitId,
      property_id: propertyId,
      file_path: path,
      file_name: file.name,
      file_type: file.type.startsWith('video/') ? 'video' : 'image',
      media_source: 'verified',
      display_order: i,
      is_cover: i === 0,
      uploaded_by: user?.id ?? null,
    });
    if (dbErr) throw new Error(`Failed to save ${file.name} in the library`);
  }
}

export function LeadActionPanel({ lead, isAgent }: { lead: LeadDetail; isAgent: boolean }) {
  const router = useRouter();
  const [action, setAction] = useState<LeadAction | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [createPayload, setCreatePayload] = useState<CreatePropertyPayload | null>(null);
  const [adminNotes, setAdminNotes] = useState(lead.admin_notes ?? '');
  const [correctionMessage, setCorrectionMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableActions = (AVAILABLE_ACTIONS[lead.status] ?? []).filter(
    candidate => candidate !== 'correction' || isAgent,
  );
  const config = action ? LEAD_ACTIONS[action] : null;

  function startAction(next: LeadAction) {
    setError('');
    setAction(next);
  }

  function cancelAction() {
    setAction(null);
    setError('');
  }

  function requestConfirmation() {
    if (action === 'correction' && !correctionMessage.trim()) {
      setError('Describe what needs correcting before sending.');
      return;
    }
    setError('');
    setConfirmationOpen(true);
  }

  async function patchLead(payload: Record<string, unknown>) {
    const response = await fetch(`/api/admin/accommodation/leads/${lead.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(await readError(response, 'An unexpected error occurred'));
    }
  }

  async function createPropertyAndUnit(payload: CreatePropertyPayload) {
    const created = await fetch('/api/admin/accommodation/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ property: payload.property, unit: payload.unit }),
    });

    if (!created.ok) {
      throw new Error(await readError(created, 'Failed to create the property'));
    }

    const data = await created.json();
    if (!data.property?.id || !data.unit?.id) {
      throw new Error('The property or unit was not returned by the server');
    }

    const useUploadedPhotos = payload.photoChoice === 'upload' && payload.photoFiles.length > 0;
    if (useUploadedPhotos) {
      await uploadVerifiedPhotos(data.unit.id, data.property.id, payload.photoFiles);
    }

    await patchLead({
      action: 'link_property',
      matched_property_id: data.property.id,
      matched_unit_id: data.unit.id,
      admin_notes: payload.adminNotes,
      photo_choice: useUploadedPhotos ? 'upload' : 'submitted',
    });

    const verified = await fetch(`/api/admin/accommodation/verify/${data.unit.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: data.property.id,
        verification_result: 'approved',
        location_confirmed: true,
        owner_confirmed: true,
        price_confirmed: true,
        availability_confirmed: true,
        photos_confirmed: true,
        facilities_confirmed: true,
        notes: 'Verified on creation via lead approval.',
      }),
    });

    if (!verified.ok) {
      throw new Error(await readError(verified, 'Property created but verification failed'));
    }
  }

  async function confirmAction() {
    if (!action) return;

    setLoading(true);
    setError('');

    try {
      if (action === 'create_property') {
        if (!createPayload) throw new Error('Fill in the property details first');
        await createPropertyAndUnit(createPayload);
      } else {
        await patchLead(PATCH_PAYLOADS[action](adminNotes, correctionMessage));
      }

      toast.success(SUCCESS_MESSAGES[action]);
      setConfirmationOpen(false);
      setAction(null);
      setCreatePayload(null);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'An unexpected error occurred');
      setConfirmationOpen(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <LeadCard>
      <SectionTitle>Actions</SectionTitle>

      {!action && availableActions.length > 0 && (
        <div className="mt-2 flex flex-col gap-2">
          {availableActions.map(candidate => {
            const candidateConfig = LEAD_ACTIONS[candidate];
            const Icon = candidateConfig.icon;
            return (
              <button
                key={candidate}
                type="button"
                onClick={() => startAction(candidate)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2.5 text-left text-[13px] font-medium transition-colors',
                  ACTION_TRIGGER_CLASS[candidateConfig.tone],
                )}
              >
                <Icon className="size-3.5 shrink-0" aria-hidden />
                {candidateConfig.label}
              </button>
            );
          })}
        </div>
      )}

      {!action && availableActions.length === 0 && (
        <p className="mt-2 text-[13px] text-muted-foreground">
          No further actions are available for this submission.
        </p>
      )}

      {action === 'reviewing' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Mark as under review and record what you have done so far.
          </p>
          <textarea
            rows={3}
            value={adminNotes}
            placeholder="e.g. Called landlord, inspection booked for Friday"
            onChange={event => setAdminNotes(event.target.value)}
            className={TEXTAREA_CLASS}
          />
          <div className="flex gap-2">
            <button type="button" onClick={requestConfirmation} disabled={loading} className={PRIMARY_BTN_CLASS}>
              {config?.cta}
            </button>
            <button type="button" onClick={cancelAction} className={SECONDARY_BTN_CLASS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'correction' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            The agent is notified and can edit their submission to address this.
          </p>
          <textarea
            rows={3}
            value={correctionMessage}
            placeholder="What needs correcting? (required)"
            onChange={event => setCorrectionMessage(event.target.value)}
            className={TEXTAREA_CLASS}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestConfirmation}
              disabled={loading || !correctionMessage.trim()}
              className={PRIMARY_BTN_CLASS}
            >
              {config?.cta}
            </button>
            <button type="button" onClick={cancelAction} className={SECONDARY_BTN_CLASS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'duplicate' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <textarea
            rows={2}
            value={adminNotes}
            placeholder="Note (optional)"
            onChange={event => setAdminNotes(event.target.value)}
            className={TEXTAREA_CLASS}
          />
          <div className="flex gap-2">
            <button type="button" onClick={requestConfirmation} disabled={loading} className={SECONDARY_BTN_CLASS}>
              {config?.cta}
            </button>
            <button type="button" onClick={cancelAction} className={SECONDARY_BTN_CLASS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'rejected' && (
        <div className="mt-2 flex flex-col gap-2.5">
          <p className="text-[13px] leading-relaxed text-muted-foreground">
            Add a reason to explain the decision (optional, shown to the submitter).
          </p>
          <textarea
            rows={2}
            value={adminNotes}
            placeholder="Reason for rejection (optional)"
            onChange={event => setAdminNotes(event.target.value)}
            className={TEXTAREA_CLASS}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={requestConfirmation}
              disabled={loading}
              className={DANGER_BTN_CLASS}
            >
              {config?.cta}
            </button>
            <button type="button" onClick={cancelAction} className={SECONDARY_BTN_CLASS}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {action === 'create_property' && (
        <LeadCreatePropertyForm
          lead={lead}
          loading={loading}
          onSubmit={payload => {
            setError('');
            setCreatePayload(payload);
            setConfirmationOpen(true);
          }}
          onCancel={cancelAction}
        />
      )}

      {error && <p className="mt-2 text-[13px] text-error">{error}</p>}

      <AlertDialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{config?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {action === 'create_property' && createPayload
                ? createPayload.photoChoice === 'upload' && createPayload.photoFiles.length > 0
                  ? `This creates the property, verifies the unit and publishes it on Campus&Me with the ${createPayload.photoFiles.length} photo${createPayload.photoFiles.length > 1 ? 's' : ''} you selected.`
                  : 'This creates the property, verifies the unit and publishes it on Campus&Me using the photos submitted with this lead.'
                : config?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={confirmAction}
              disabled={loading}
              className={cn(
                config?.tone === 'error' ? DANGER_BTN_CLASS : PRIMARY_BTN_CLASS,
                'min-h-9 flex-none',
              )}
            >
              {loading ? 'Saving…' : config?.confirmLabel}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LeadCard>
  );
}