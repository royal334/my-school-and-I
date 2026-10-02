// lib/services/notification-service.ts
import { createAdminClient } from '@/utils/supabase/admin';

interface NotificationPayload {
  userId: string; // Single user
  type: 'announcement' | 'vendor' | 'marketplace' | 'accommodation' | 'platform';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

interface FcmSendDetail {
  token: string;
  ok: boolean;
  error?: string;
  errorCode?: string | null;
}

interface BulkNotificationPayload {
  userIds: string[]; // Multiple users
  type: 'announcement' | 'vendor' | 'marketplace' | 'accommodation' | 'platform';
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Map notification type to preference column
const TYPE_TO_PREFERENCE_COLUMN: Record<string, string> = {
  announcement: 'announcement_notifications',
  vendor: 'vendor_notifications',
  marketplace: 'marketplace_notifications',
  accommodation: 'accommodation_notifications',
  platform: 'platform_notifications',
};

/**
 * Send notification to a single user
 */
export async function sendNotification(payload: NotificationPayload) {
  return sendBulkNotification({
    userIds: [payload.userId],
    type: payload.type,
    title: payload.title,
    body: payload.body,
    data: payload.data,
  });
}

/**
 * Send notification to multiple users (respects preferences)
 */
export async function sendBulkNotification(payload: BulkNotificationPayload) {
  const supabase = createAdminClient();
  const preferenceColumn = TYPE_TO_PREFERENCE_COLUMN[payload.type];

  try {
    // 1. Filter users who have opted in to this notification type
    const { data: eligibleUsers, error: prefError } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .in('user_id', payload.userIds)
      .eq(preferenceColumn, true);

    if (prefError) throw prefError;

    // Users without a preference row default to opted-in
    const usersWithPrefs = new Set((eligibleUsers || []).map((u) => u.user_id));
    const { data: allPrefs } = await supabase
      .from('user_notification_preferences')
      .select('user_id')
      .in('user_id', payload.userIds);

    const usersWithAnyPrefRow = new Set((allPrefs || []).map((u) => u.user_id));
    const usersWithNoPrefRow = payload.userIds.filter(
      (id) => !usersWithAnyPrefRow.has(id)
    );

    const finalEligibleUserIds = [
      ...Array.from(usersWithPrefs),
      ...usersWithNoPrefRow, // Default opt-in if no row exists
    ];

    if (finalEligibleUserIds.length === 0) {
      return { success: true, sent: 0, message: 'No eligible users' };
    }

    // 2. Get device tokens for eligible users
    const { data: tokens, error: tokenError } = await supabase
      .from('user_notification_tokens')
      .select('device_token, user_id')
      .in('user_id', finalEligibleUserIds);

    if (tokenError) throw tokenError;

    if (!tokens || tokens.length === 0) {
      return { success: true, sent: 0, message: 'No device tokens found' };
    }

    const deviceTokens = tokens.map((t) => t.device_token);

    // 3. Call Edge Function to send via FCM
    const { data: fcmResult, error: fcmError } = await supabase.functions.invoke(
      'send-notification',
      {
        body: {
          tokens: deviceTokens,
          title: payload.title,
          body: payload.body,
          link: process.env.NEXT_PUBLIC_APP_URL
            ? `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/notifications`
            : undefined,
          data: {
            type: payload.type,
            ...payload.data,
          },
        },
      }
    );

    // The function answers non-2xx when no token could be delivered, so this
    // covers "every recipient's token is dead" rather than just transport loss.
    if (fcmError) throw fcmError;

    const details: FcmSendDetail[] = Array.isArray(fcmResult?.details)
      ? fcmResult.details
      : [];

    // If the deployed function predates per-token reporting, fall back to
    // treating every token as delivered rather than silently logging nothing.
    const acceptedTokens = new Set(
      details.length > 0
        ? details.filter((detail) => detail.ok).map((detail) => detail.token)
        : deviceTokens
    );

    // 4. Only recipients with a token FCM actually accepted get a panel row.
    // Writing rows for the full eligible set is what let the panel look
    // delivered while no browser ever showed a notification.
    const deliveredUserIds = Array.from(
      new Set(
        tokens
          .filter((token) => acceptedTokens.has(token.device_token))
          .map((token) => token.user_id)
      )
    );

    const failedDetails = details.filter((detail) => !detail.ok);

    if (failedDetails.length > 0) {
      console.warn(
        `FCM rejected ${failedDetails.length}/${deviceTokens.length} token(s) for "${payload.title}":`,
        failedDetails.map((detail) => ({
          token: `${detail.token.slice(0, 12)}...`,
          errorCode: detail.errorCode,
          error: detail.error,
        }))
      );
    }

    // 5. Get notification_type_id for logging
    const { data: notifType } = await supabase
      .from('notification_types')
      .select('id')
      .eq('type_key', payload.type)
      .single();

    // 6. Log notifications in DB
    if (deliveredUserIds.length > 0) {
      const logs = deliveredUserIds.map((userId) => ({
        user_id: userId,
        notification_type_id: notifType?.id || null,
        title: payload.title,
        body: payload.body,
        data: payload.data || {},
      }));

      await supabase.from('notifications_sent').insert(logs);
    }

    return {
      success: deliveredUserIds.length > 0,
      sent: deliveredUserIds.length,
      eligible: finalEligibleUserIds.length,
      tokensFound: deviceTokens.length,
      tokensRejected: failedDetails.length,
      fcmResult,
    };
  } catch (error: unknown) {
    console.error('Notification service error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}

/**
 * Send to ALL users (platform-wide announcements)
 * Use sparingly - for major feature announcements
 */
export async function sendPlatformNotification(data: {
  title: string;
  body: string;
  extraData?: Record<string, unknown>;
}) {
  const supabase = createAdminClient();

  // Get all user IDs
  const { data: allUsers, error } = await supabase
    .from('profiles')
    .select('id');

  if (error) throw error;

  const userIds = (allUsers || []).map((u) => u.id);

  return sendBulkNotification({
    userIds,
    type: 'platform',
    title: data.title,
    body: data.body,
    data: data.extraData,
  });
}

/**
 * Register a device token for push notifications
 */
export async function registerDeviceToken(
  userId: string,
  token: string,
  deviceType: 'web' | 'ios' | 'android' = 'web'
) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('user_notification_tokens')
    .upsert(
      {
        user_id: userId,
        device_token: token,
        device_type: deviceType,
      },
      { onConflict: 'user_id,device_token' }
    );

  if (error) throw error;

  return { success: true };
}

/**
 * Remove a device token (on logout or unsubscribe)
 */
export async function removeDeviceToken(userId: string, token: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from('user_notification_tokens')
    .delete()
    .eq('user_id', userId)
    .eq('device_token', token);

  if (error) throw error;

  return { success: true };
}