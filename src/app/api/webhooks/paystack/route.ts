import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers"
import { createClient } from '@/utils/supabase/server';
import { verifyPaystackWebhook } from '@/utils/lib/paystack';

// Use service role key for webhook (bypasses RLS)
const supabase = createClient(await cookies());

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    if (!verifyPaystackWebhook(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = JSON.parse(body);

    // Handle charge.success event
    if (event.event === 'charge.success') {
      const { reference, metadata } = event.data;

      // Get payment record
      const { data: payment } = await supabase
        .from('payments')
        .select('*')
        .eq('reference', reference)
        .single();

      if (!payment) {
        console.error('Payment not found:', reference);
        return NextResponse.json({ received: true });
      }

      // Activate subscription
      const { error } = await supabase.rpc('activate_subscription', {
        p_user_id: metadata.user_id,
        p_payment_id: payment.id,
      });

      if (error) {
        console.error('Webhook activation error:', error);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}