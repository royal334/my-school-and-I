'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/utils/supabase/client';

const payoutDetailsSchema = z.object({
  bank_name: z.string().trim().min(2, 'Enter your bank name').max(100),
  account_name: z.string().trim().min(2, 'Enter the name on the account').max(100),
  account_number: z
    .string()
    .regex(/^\d{6,20}$/, 'Enter an account number containing 6 to 20 digits'),
});

export type AccommodationPayoutDetails = z.infer<typeof payoutDetailsSchema>;

interface AccommodationPayoutDetailsFormProps {
  userId: string;
  initialValues: AccommodationPayoutDetails | null;
}

export function AccommodationPayoutDetailsForm({
  userId,
  initialValues,
}: AccommodationPayoutDetailsFormProps) {
  const supabase = createClient();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccommodationPayoutDetails>({
    resolver: zodResolver(payoutDetailsSchema),
    defaultValues: initialValues ?? {
      bank_name: '',
      account_name: '',
      account_number: '',
    },
  });

  const onSubmit = async (values: AccommodationPayoutDetails) => {
    const { error } = await supabase
      .from('accommodation_payout_details')
      .upsert(
        {
          user_id: userId,
          bank_name: values.bank_name,
          account_name: values.account_name,
          account_number: values.account_number,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );

    if (error) {
      toast.error(error.message || 'Could not save payout details');
      return;
    }

    toast.success('Payout details saved');
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Accommodation referral payout</h2>
        <p className="text-sm text-muted-foreground">
          Add the bank account where your referral reward should be paid.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="payout-bank-name">Bank</Label>
              <Input
                id="payout-bank-name"
                autoComplete="organization"
                maxLength={100}
                {...register('bank_name')}
                aria-invalid={Boolean(errors.bank_name)}
              />
              {errors.bank_name && (
                <p className="text-xs text-destructive">{errors.bank_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payout-account-name">Account name</Label>
              <Input
                id="payout-account-name"
                autoComplete="name"
                maxLength={100}
                {...register('account_name')}
                aria-invalid={Boolean(errors.account_name)}
              />
              {errors.account_name && (
                <p className="text-xs text-destructive">{errors.account_name.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2 md:max-w-sm">
            <Label htmlFor="payout-account-number">Account number</Label>
            <Input
              id="payout-account-number"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={20}
              {...register('account_number')}
              aria-invalid={Boolean(errors.account_number)}
            />
            {errors.account_number && (
              <p className="text-xs text-destructive">{errors.account_number.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save payout details'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}