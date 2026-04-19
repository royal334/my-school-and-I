import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { verifyPaystackTransaction, fromKobo } from '@/utils/lib/paystack';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get('reference');
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  try {
    console.log('Verifying subscription for reference:', reference);

    if (!reference) {
      console.error('No reference provided in search params');
      return NextResponse.redirect(`${siteUrl}/dashboard/vendors?error=no_reference`);
    }

    const supabase = createClient(await cookies());

    // Verify transaction with Paystack using helper
    const verification = await verifyPaystackTransaction(reference);
    console.log('Paystack verification response status:', verification.status);

    if (!verification.status) {
      console.error('Paystack verification failed:', verification.message);
      return NextResponse.redirect(`${siteUrl}/dashboard/vendors?error=verification_failed`);
    }

    const paymentData = verification.data;
    console.log('Payment status:', paymentData.status);

    // Check if payment was successful
    if (paymentData.status !== 'success') {
      console.error('Payment not successful. Status:', paymentData.status);
      return NextResponse.redirect(`${siteUrl}/dashboard/vendors?error=payment_failed`);
    }

    // Robust metadata extraction
    let metadata = paymentData.metadata;
    
    // Paystack sometimes stringifies metadata
    if (typeof metadata === 'string') {
      try {
        metadata = JSON.parse(metadata);
      } catch (e) {
        console.error('Failed to parse metadata string:', metadata);
      }
    }

    if (!metadata || !metadata.vendor_id) {
      console.error('Missing required metadata in payment data:', metadata);
      return NextResponse.redirect(`${siteUrl}/dashboard/vendors?error=invalid_metadata`);
    }

    const { vendor_id, tier, user_id } = metadata;
    console.log('Processing upgrade for vendor:', vendor_id, 'to tier:', tier);

    // Calculate subscription period (1 month)
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Update vendor subscription - Using only existing columns based on schema
    const { error: updateError } = await supabase
      .from('vendors')
      .update({
        subscription_tier: tier,
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq('id', vendor_id);

    if (updateError) {
      console.error('Vendor table update error:', updateError);
      throw updateError;
    }

    // Record subscription history - Check if this table exists or skip if it fails
    try {
      const { error: historyError } = await supabase.from('vendor_subscription_history').insert({
        vendor_id,
        tier,
        amount: fromKobo(paymentData.amount),
        currency: paymentData.currency,
        payment_reference: reference,
        starts_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        status: 'active',
      });

      if (historyError) {
        console.warn('Subscription history record error (table might not exist):', historyError.message);
      }
    } catch (e) {
      console.warn('Subscription history insert failed:', e);
    }

    // Update payment record
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        paid_at: paymentData.paid_at,
      })
      .eq('reference', reference);

    if (paymentUpdateError) {
      console.error('Payment record update error:', paymentUpdateError);
    }

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user_id || paymentData.customer?.id,
      action: 'subscription_completed',
      details: {
        vendor_id,
        tier,
        reference,
        amount: fromKobo(paymentData.amount),
      },
    });

    console.log('Subscription verification successful for vendor:', vendor_id);

    // Redirect to success page
    return NextResponse.redirect(
      `${siteUrl}/dashboard/vendors/${vendor_id}?upgraded=true&tier=${tier}`
    );
  } catch (error: any) {
    console.error('Subscription verification exception:', error);
    return NextResponse.redirect(`${siteUrl}/dashboard/vendors?error=server_error`);
  }
}