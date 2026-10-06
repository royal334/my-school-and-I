// app/api/accommodation/viewings/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { cancelActiveViewingsForUnit } from '@/utils/lib/services/accommodation-viewings';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      unit_id,
      property_id,
      student_name,
      student_phone,
      preferred_date,
      preferred_time,
      message,
    } = body;

    if (!unit_id || !property_id || !student_name || !student_phone) {
      return NextResponse.json(
        { error: 'unit_id, property_id, student_name and student_phone are required' },
        { status: 400 }
      );
    }

    // Check unit is still available
    const { data: unit } = await supabase
      .from('accommodation_units')
      .select('id, availability_status')
      .eq('id', unit_id)
      .single();

    if (!unit || unit.availability_status !== 'available') {
      return NextResponse.json(
        { error: 'This listing is no longer available' },
        { status: 400 }
      );
    }

    // Check if student already has a pending viewing for this unit
    const { data: existing } = await supabase
      .from('accommodation_viewings')
      .select('id')
      .eq('unit_id', unit_id)
      .eq('student_id', user.id)
      .in('status', ['pending', 'scheduled'])
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'You already have a viewing request for this property' },
        { status: 400 }
      );
    }

    const { data: viewing, error } = await supabase
      .from('accommodation_viewings')
      .insert({
        student_id: user.id,
        unit_id,
        property_id,
        student_name,
        student_phone,
        preferred_date: preferred_date || null,
        preferred_time: preferred_time || null,
        message: message || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;

    const { data: currentUnit, error: currentUnitError } = await supabase
      .from('accommodation_units')
      .select('availability_status')
      .eq('id', unit_id)
      .single();

    if (currentUnitError) throw currentUnitError;

    if (currentUnit.availability_status === 'unavailable' || currentUnit.availability_status === 'rented') {
      await cancelActiveViewingsForUnit(unit_id, currentUnit.availability_status);
      return NextResponse.json(
        { error: 'This listing is no longer available. Your viewing request was cancelled.' },
        { status: 400 }
      );
    }

    // Notify admin team
    const { data: admins } = await supabase
      .from('admin_roles')
      .select('user_id')
      .in('role', ['super_admin', 'admin']);

    if (admins && admins.length > 0) {
      const { sendBulkNotification } = await import('@/utils/lib/services/notification-service');
      sendBulkNotification({
        userIds: admins.map((a: any) => a.user_id),
        type: 'accommodation',
        title: 'New viewing request',
        body: `${student_name} requested a viewing`,
        data: {
          viewing_id: viewing.id,
          unit_id,
          deeplink: `/admin/accommodation/viewings/${viewing.id}`,
        },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      viewing,
      message: 'Viewing request submitted. We will contact you to confirm.',
    });
  } catch (error: any) {
    console.error('Create viewing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit viewing request' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: viewings, error } = await supabase
      .from('accommodation_viewings')
      .select(`
        *,
        unit:accommodation_units (
          id, unit_number, room_type, price,
          property:accommodation_properties (id, name, area)
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ viewings: viewings || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch viewings' },
      { status: 500 }
    );
  }
}