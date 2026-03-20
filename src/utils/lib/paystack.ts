import crypto from 'crypto';

export interface PaystackTransaction {
  email: string;
  amount: number; // in kobo (₦1000= 100000)
  reference: string;
  metadata?: {
    user_id: string;
    full_name: string;
    subscription_type: string;
    [key: string]: any;
  };
  callback_url?: string;
}

/**
 * Initialize Paystack transaction
 */
export async function initializePaystackTransaction(
  data: PaystackTransaction
) {
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_LIVE_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize Paystack transaction');
  }

  return response.json();
}

/**
 * Verify Paystack transaction
 */
export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_LIVE_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to verify Paystack transaction');
  }

  return response.json();
}

/**
 * Verify Paystack webhook signature
 */
export function verifyPaystackWebhook(
  payload: string,
  signature: string
): boolean {
  const hash = crypto
    .createHmac('sha512', process.env.NEXT_PUBLIC_PAYSTACK_LIVE_SECRET_KEY!)
    .update(payload)
    .digest('hex');

  return hash === signature;
}

/**
 * Generate unique payment reference
 */
export function generatePaymentReference(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ENGI_${userId.slice(0, 8)}_${timestamp}_${random}`;
}

/**
 * Format amount to kobo (Paystack uses kobo)
 */
export function toKobo(naira: number): number {
  return Math.round(naira * 100);
}

/**
 * Format amount from kobo to naira
 */
export function fromKobo(kobo: number): number {
  return kobo / 100;
}