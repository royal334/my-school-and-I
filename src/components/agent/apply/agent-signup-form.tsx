'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CampusMeLogo } from '@/components/brand/logo';
import { ID_TYPES, OPERATING_AREAS } from '@/components/agent/constants';
import { PasswordRequirements } from '@/components/auth/password-requirements';
import { passwordStrengthSchema } from '@/lib/validations/password';

export function AgentSignupForm() {
  const router = useRouter();
  const [operatingAreas, setOperatingAreas] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmationPending, setConfirmationPending] = useState(false);
  const [passwordValue, setPasswordValue] = useState('');

  function toggleArea(area: string) {
    setOperatingAreas((current) =>
      current.includes(area)
        ? current.filter((selected) => selected !== area)
        : [...current, area],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData(event.currentTarget);
      const passwordValue = formData.get('password');
      const password = typeof passwordValue === 'string' ? passwordValue : '';
      const passwordResult = passwordStrengthSchema.safeParse(password);
      if (!passwordResult.success) {
        throw new Error(passwordResult.error.issues[0]?.message || 'Enter a valid password.');
      }
      operatingAreas.forEach((area) => formData.append('operating_areas', area));

      const response = await fetch('/api/auth/agent-signup', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Could not create your agent account.');
      }

      if (result.requiresEmailConfirmation) {
        setConfirmationPending(true);
        toast.success('Account created', {
          description: 'Check your email to confirm your account and submit your application.',
          position: 'top-center',
        });
        return;
      }

      toast.success('Agent account created. Your application is under review.', {
        position: 'top-center',
      });
      router.push('/agent/status');
      router.refresh();
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Could not create your agent account.';
      setError(message);
      toast.error(message, { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmationPending) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto w-full max-w-lg space-y-5">
          <CampusMeLogo />
          <section className="rounded-2xl border border-border bg-card p-6">
            <h1 className="text-xl font-semibold">Confirm your email</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your agent account has been created. Follow the confirmation link in your email to
              finish signing in and view your application status.
            </p>
            <Link
              href="/login?next=%2Fagent%2Fstatus"
              className="mt-5 inline-flex text-sm font-semibold text-primary-600 underline"
            >
              Go to sign in
            </Link>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto w-full max-w-lg space-y-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="size-4" aria-hidden />
            Back to Campus&Me
          </Link>
          <CampusMeLogo compact />
        </div>

        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
          <h1 className="text-2xl font-semibold">Create your agent account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Share verified accommodation with students. Your application will be reviewed before
            you can submit properties.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full name</Label>
              <Input id="full_name" name="full_name" autoComplete="name" required minLength={3} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_name">Name / agency name</Label>
              <Input id="display_name" name="display_name" required minLength={2} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone_number">Phone number</Label>
              <Input id="phone_number" name="phone_number" type="tel" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={8}
                pattern="(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}"
                required
                onChange={(event) => setPasswordValue(event.target.value)}
              />
              <PasswordRequirements value={passwordValue} />
            </div>

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium">Operating areas</legend>
              <div className="grid grid-cols-2 gap-2">
                {OPERATING_AREAS.map((area) => (
                  <label
                    key={area}
                    className="flex min-h-10 items-center gap-2 rounded-lg border border-border px-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={operatingAreas.includes(area)}
                      onChange={() => toggleArea(area)}
                    />
                    {area}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="bio">About you (optional)</Label>
              <Textarea id="bio" name="bio" rows={3} maxLength={1000} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_type">ID type (optional)</Label>
              <select
                id="id_type"
                name="id_type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                defaultValue=""
              >
                <option value="">Select an ID type</option>
                {ID_TYPES.map((idType) => (
                  <option key={idType} value={idType}>{idType}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="id_document">ID document (optional, PDF/JPEG/PNG/WebP, up to 5 MB)</Label>
              <Input
                id="id_document"
                name="id_document"
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Creating account…
                </span>
              ) : (
                'Create account & apply'
              )}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already registered?{' '}
            <Link href="/login?next=%2Fagent%2Fstatus" className="font-semibold text-primary-600 underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
