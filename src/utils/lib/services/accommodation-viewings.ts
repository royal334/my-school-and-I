import { createAdminClient } from '@/utils/supabase/admin';
import { sendBulkNotification } from '@/utils/lib/services/notification-service';

export async function cancelActiveViewingsForUnit(
  unitId: string,
  availabilityStatus: 'unavailable' | 'rented',
) {
  const supabase = createAdminClient();
  let cancelledViewings;

  try {
    const { data, error } = await supabase
      .from('accommodation_viewings')
      .update({ status: 'cancelled' })
      .eq('unit_id', unitId)
      .in('status', ['pending', 'scheduled'])
      .select('student_id');

    if (error) throw error;
    cancelledViewings = data || [];
  } catch (error: unknown) {
    console.error('Failed to cancel active viewings for unit:', {
      unit_id: unitId,
      error: error instanceof Error ? error.message : error,
    });
    throw error;
  }

  if (cancelledViewings.length === 0) {
    return { cancelledCount: 0 };
  }

  const studentIds = [...new Set(cancelledViewings.map((viewing) => viewing.student_id))];
  let notifiedCount = 0;

  try {
    const notificationResult = await sendBulkNotification({
      userIds: studentIds,
      type: 'accommodation',
      title: 'Viewing request cancelled',
      body: `The unit is now ${availabilityStatus}. Your viewing request has been cancelled.`,
      data: {
        unit_id: unitId,
      },
    });

    if (notificationResult.success) {
      notifiedCount = notificationResult.sent ?? 0;
    } else {
      console.error('Failed to notify students about cancelled viewings:', {
        unit_id: unitId,
        error: notificationResult.error,
      });
    }
  } catch (error: unknown) {
    console.error('Failed to notify students about cancelled viewings:', {
      unit_id: unitId,
      error: error instanceof Error ? error.message : error,
    });
  }

  return {
    cancelledCount: cancelledViewings.length,
    notifiedCount,
  };
}