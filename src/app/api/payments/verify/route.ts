import { createClient } from '@/utils/supabase/server';
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from 'next/server';
import { verifyPaystackTransaction } from '@/utils/lib/paystack';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Reference is required' },
        { status: 400 }
      );
    }

    const supabase = createClient(await cookies());

    // Verify with Paystack
    const verification = await verifyPaystackTransaction(reference);

    if (!verification.status || verification.data.status !== 'success') {
      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get payment record
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('reference', reference)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Activate subscription (using Supabase function)
    const { error: activationError } = await supabase.rpc(
      'activate_subscription',
      {
        p_user_id: payment.user_id,
        p_payment_id: payment.id,
      }
    );

    if (activationError) {
      console.error('Activation error:', activationError);
      return NextResponse.json(
        { error: 'Failed to activate subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription activated successfully',
      data: verification.data,
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}