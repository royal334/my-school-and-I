'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { BadgeCheck, Send } from 'lucide-react';
import { usePostHogAnalytics } from '@/hooks/posthog-events';
import { POSTHOG_EVENTS } from '@/utils/constants/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface VendorVerificationFormProps {
  vendorId: string;
  businessName: string;
  email: string;
  phone: string;
  location: string;
  tier: string;
  isVerified: boolean;
}

export function VendorVerificationForm({
  vendorId,
  businessName,
  email,
  phone,
  location,
  tier,
  isVerified,
}: VendorVerificationFormProps) {
  const { track } = usePostHogAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as Record<string, string>;

    data.access_key = process.env.NEXT_PUBLIC_WEB3FORMS_ID || '';
    data.subject = `Vendor verification request — ${businessName}`;
    data.from_name = 'Campus&Me Vendor Verification';
    data.replyto = data.contact_email;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const result = await response.json();

      if (result.success) {
        track(POSTHOG_EVENTS.vendorVerificationRequested, {
          vendor_id: vendorId,
          subscription_tier: tier,
        });
        setSubmitted(true);
        toast.success('Verification request sent!', {
          position: 'top-center',
        });
      } else {
        throw new Error(result.message || 'Something went wrong');
      }
    } catch (error) {
      const message =
        error instanceof Error && error.name === 'AbortError'
          ? 'Request timed out. Please try again.'
          : error instanceof Error
            ? error.message
            : 'Failed to send verification request';
      toast.error(message, { position: 'top-center' });
    } finally {
      setIsSubmitting(false);
      clearTimeout(timeoutId);
    }
  };

  if (submitted) {
    return (
      <Card className="mx-auto w-full max-w-md border-border bg-card py-12 text-center">
        <CardContent className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 dark:bg-success/20">
            <BadgeCheck className="h-8 w-8 text-success" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl">Request Received!</CardTitle>
            <CardDescription className="text-muted-foreground">
              Your details have been sent to our support team. We&apos;ll review
              your vendor verification and reach out shortly.
            </CardDescription>
          </div>
          <Link href="/dashboard/vendors" className="mt-4 inline-block">
            <Button>Back to Vendors</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-2xl border-border bg-card">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Request Vendor Verification
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Confirm your business details and send them to our support team for a
          verified badge on your profile.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <input type="hidden" name="vendor_id" value={vendorId} />
          <input type="hidden" name="subscription_tier" value={tier} />
          <input type="hidden" name="vendor_email" value={email} />
          <input type="hidden" name="current_verified" value={isVerified ? 'yes' : 'no'} />

          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name</Label>
            <Input
              id="business_name"
              name="business_name"
              value={businessName}
              readOnly
              className="bg-muted text-muted-foreground"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Person</Label>
              <Input
                id="contact_name"
                name="contact_name"
                placeholder="Full name"
                required
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                name="contact_email"
                type="email"
                required
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone_number">Contact Number</Label>
              <Input
                id="phone_number"
                name="phone_number"
                defaultValue={phone}
                placeholder="Phone number"
                required
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_whatsapp_number">Contact WhatsApp Number</Label>
              <Input
                id="contact_whatsapp_number"
                name="contact_whatsapp_number"
                required
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Business Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={location}
                placeholder="Shop / office address"
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registration_number">Registration / ID Number</Label>
              <Input
                id="registration_number"
                name="registration_number"
                placeholder="CAC / business registration no."
                required
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="details">Additional Details</Label>
            <Textarea
              id="details"
              name="details"
              placeholder="Tell us anything else we should know to verify your business..."
              className="min-h-[120px] resize-none bg-muted"
            />
          </div>

          <input
            type="checkbox"
            name="botcheck"
            className="hidden"
            style={{ display: 'none' }}
          />
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3">
          <Button
            type="submit"
            className="w-full font-semibold text-white transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              'Sending...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Verification Request
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Your details are sent directly to our support team for review.
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
