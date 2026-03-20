import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  initializePaystackTransaction,
  generatePaymentReference,
} from "@/utils/lib/paystack";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(await cookies());

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check if already has active subscription
    if (
      profile.subscription_status === "active" &&
      profile.subscription_expires_at &&
      new Date(profile.subscription_expires_at) > new Date()
    ) {
      return NextResponse.json(
        { error: "You already have an active subscription" },
        { status: 400 },
      );
    }

    // Generate payment reference
    const reference = generatePaymentReference(user.id);

    // Create payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: user.id,
        reference,
        amount: parseInt(process.env.SUBSCRIPTION_PRICE || "100000"),
        status: "pending",
        type: "semester_subscription",
        currency: "NGN",
        metadata: {
          subscription_type: "premium",
          user_email: user.email,
        },
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Payment record error:", paymentError);
      return NextResponse.json(
        { error: "Failed to create payment record" },
        { status: 500 },
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await initializePaystackTransaction({
      email: user.email!,
      amount: parseInt(process.env.SUBSCRIPTION_PRICE || "100000"),
      reference,
      metadata: {
        user_id: user.id,
        full_name: profile.full_name,
        subscription_type: "premium",
        payment_id: payment.id,
      },
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payments/verify?reference=${reference}`,
    });

    if (!paystackResponse.status) {
      return NextResponse.json(
        { error: "Failed to initialize payment" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      authorization_url: paystackResponse.data.authorization_url,
      access_code: paystackResponse.data.access_code,
      reference,
    });
  } catch (error: any) {
    console.error("Payment initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 },
    );
  }
}
