'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { DEFAULT_LISTING_DRAFT, SELL_STEPS } from '@/components/marketplace/constants';
import { MARKETPLACE_API_PATH, MARKETPLACE_BASE_PATH } from '@/components/marketplace/filters';
import { SellHeader } from '@/components/marketplace/sell/sell-header';
import { SlotCounter } from '@/components/marketplace/sell/slot-counter';
import { SlotLimitModal } from '@/components/marketplace/sell/slot-limit-modal';
import { ListingDetailsStep } from '@/components/marketplace/sell/listing-details-step';
import { ListingPricingStep } from '@/components/marketplace/sell/listing-pricing-step';
import { ListingPhotoStep } from '@/components/marketplace/sell/listing-photo-step';
import type { ListingDraft, SellerSlots } from '@/components/marketplace/types';

interface SellWizardProps {
  sellerId: string;
  slots: SellerSlots;
  /** Prefilled values when editing an existing listing, null when creating one. */
  initialDraft: ListingDraft | null;
  editId: string | null;
}

function validateStep(step: number, draft: ListingDraft): string | null {
  if (step === 0) {
    if (!draft.title.trim()) return 'Title is required';
    if (!draft.category) return 'Select a category';
  }
  if (step === 1) {
    if (!draft.condition) return 'Select a condition';
    if (!draft.price || Number.parseFloat(draft.price) <= 0) return 'Enter a valid price';
  }
  return null;
}

export function SellWizard({ sellerId, slots, initialDraft, editId }: SellWizardProps) {
  const router = useRouter();
  const isEditing = editId !== null;

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<ListingDraft>(initialDraft ?? DEFAULT_LISTING_DRAFT);
  const [createdListingId, setCreatedListingId] = useState<string | null>(editId);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showLimitModal, setShowLimitModal] = useState(!isEditing && slots.available_slots <= 0);

  function update(patch: Partial<ListingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function handleNext() {
    const validationError = validateStep(step, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');

    if (step === 1) {
      await saveListing();
      return;
    }

    setStep((prev) => prev + 1);
  }

  async function saveListing() {
    setSubmitting(true);

    const body = {
      title: draft.title,
      description: draft.description || null,
      price: draft.price,
      negotiable: draft.negotiable,
      condition: draft.condition,
      location: draft.location || null,
      is_urgent: draft.isUrgent,
      // The PATCH endpoint does not allow moving a listing between categories.
      ...(editId ? {} : { category: draft.category }),
    };

    try {
      const res = await fetch(
        editId ? `${MARKETPLACE_API_PATH}/listings/${editId}` : `${MARKETPLACE_API_PATH}/listings`,
        {
          method: editId ? 'PATCH' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.error === 'listing_limit_reached') {
          setShowLimitModal(true);
          return;
        }
        throw new Error(data.error || 'Could not save the listing');
      }

      if (editId) {
        toast.success('Listing updated.');
        router.push(`${MARKETPLACE_BASE_PATH}/${editId}`);
        return;
      }

      setCreatedListingId(data.listing.id);
      setStep(2);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleBack() {
    if (step > 0) {
      setStep((prev) => prev - 1);
      return;
    }
    router.back();
  }

  function handlePhotosUploaded() {
    if (createdListingId) router.push(`${MARKETPLACE_BASE_PATH}/${createdListingId}`);
  }

  return (
    <div className="pb-16">
      <SellHeader step={step} isEditing={isEditing} onBack={handleBack} />

      {!isEditing && <SlotCounter slots={slots} />}

      <div className="px-4 py-5">
        {step === 0 && <ListingDetailsStep draft={draft} onChange={update} />}
        {step === 1 && <ListingPricingStep draft={draft} onChange={update} />}
        {step === 2 && (
          <ListingPhotoStep
            listingId={createdListingId}
            sellerId={sellerId}
            isEditing={isEditing}
            onUploaded={handlePhotosUploaded}
          />
        )}

        {error && <p className="mt-3 text-[13px] text-error">{error}</p>}

        {step < SELL_STEPS.length - 1 && (
          <Button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="mt-6 min-h-11 w-full"
          >
            {submitting
              ? 'Saving…'
              : step === 1
                ? isEditing
                  ? 'Save changes'
                  : 'Create listing'
                : 'Continue'}
          </Button>
        )}
      </div>

      {showLimitModal && (
        <SlotLimitModal slots={slots} onClose={() => setShowLimitModal(false)} />
      )}
    </div>
  );
}