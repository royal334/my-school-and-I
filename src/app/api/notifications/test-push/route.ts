import { createClient } from '@/utils/supabase/server';
import { createAdminClient } from '@/utils/supabase/admin';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

interface FcmSendDetail {
  token: string;
  ok: boolean;
  error?: string;
  errorCode?: string | null;
}

/**
 * Sends a push to the caller's own devices only, bypassing notification
 * preferences, and returns the per-token FCM verdict.
 *
 * This is the isolation tool for the panel/push split: the response states
 * whether FCM accepted the token, so a successful call with no popup points at
 * the browser or OS layer rather than at the database or the send pipeline.
 */
export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: tokens, error: tokenError } = await admin
      .from('user_notification_tokens')
      .select('device_token, device_type')
      .eq('user_id', user.id);

    if (tokenError) throw tokenError;

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        {
          success: false,
          stage: 'database',
          error: 'No device tokens registered for this account',
        },
        { status: 400 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const link = process.env.NEXT_PUBLIC_APP_URL
      ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications`
      : undefined;

    const { data: fcmResult, error: fcmError } = await admin.functions.invoke('send-notification', {
      body: {
        tokens: tokens.map((token) => token.device_token),
        title: typeof body.title === 'string' ? body.title.slice(0, 120) : 'Test notification',
        body: typeof body.message === 'string' ? body.message.slice(0, 240) : 'Push delivery check',
        link,
        data: { type: 'platform', test: 'true' },
      },
    });

    const details: FcmSendDetail[] = Array.isArray(fcmResult?.details)
      ? fcmResult.details
      : [];

    const succeeded = details.filter((detail) => detail.ok).length;

    return NextResponse.json({
      success: succeeded > 0,
      stage: 'fcm',
      tokensRegistered: tokens.length,
      tokensAccepted: succeeded,
      tokensRejected: details.length - succeeded,
      details: details.map((detail) => ({
        token: `${detail.token.slice(0, 12)}...`,
        ok: detail.ok,
        errorCode: detail.errorCode ?? null,
        error: detail.error ?? null,
      })),
      hint: succeeded > 0
        ? 'FCM accepted the token. If no popup appeared, the failure is in the browser or OS layer — check the SW is active, then OS-level blocking and whether the tab was focused.'
        : 'FCM rejected every token. Re-register the device; the stored token is stale or invalid.',
      transportError: fcmError ? fcmError.message : null,
    });
  } catch (error: unknown) {
    console.error('Test push error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test push' },
      { status: 500 }
    );
  }
}