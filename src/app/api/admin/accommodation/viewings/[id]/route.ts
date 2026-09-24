// app/api/admin/accommodation/viewings/[id]/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

async function isAdmin(supabase: any, userId: string) {
  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', userId)
    .in('role', ['super_admin', 'admin'])
    .single();
  return !!data;
}

// GET /api/admin/accommodation/viewings/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const { data: viewing, error } = await supabase
      .from('accommodation_viewings')
      .select(`
        *,
        unit:accommodation_units (
          id, unit_number, room_type, price,
          property:accommodation_properties (
            id, name, area, landlord_name, landlord_phone, caretaker_name, caretaker_phone
          )
        )
      `)
      .eq('id', id)
      .single();

    if (error || !viewing) {
      return NextResponse.json({ error: 'Viewing not found' }, { status: 404 });
    }

    return NextResponse.json({ viewing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/accommodation/viewings/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const body = await request.json();
    const { status, scheduled_date, admin_notes } = body;

    const { data: viewing, error } = await supabase
      .from('accommodation_viewings')
      .update({
        status,
        scheduled_date: scheduled_date || null,
        admin_notes: admin_notes || null,
        assigned_to: user.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Notify student of status update
    const notifications: Record<string, { title: string; body: string }> = {
      scheduled: {
        title: 'Viewing confirmed!',
        body: scheduled_date
          ? `Your viewing has been scheduled. Check the app for details.`
          : `Your viewing request has been confirmed.`,
      },
      cancelled: {
        title: 'Viewing cancelled',
        body: 'Your viewing request was cancelled. You can request another time.',
      },
      completed: {
        title: 'Viewing completed',
        body: 'Thanks for viewing the property. Let us know if you are interested.',
      },
    };

    const notif = notifications[status];
    if (notif) {
      const { sendNotification } = await import('@/utils/lib/services/notification-service');
      sendNotification({
        userId: viewing.student_id,
        type: 'accommodation',
        title: notif.title,
        body: notif.body,
        data: { viewing_id: viewing.id },
      }).catch(console.error);
    }

    return NextResponse.json({ success: true, viewing });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}