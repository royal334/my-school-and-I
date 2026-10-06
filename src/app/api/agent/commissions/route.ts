// app/api/agent/commissions/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// GET /api/agent/commissions
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get agent record
    const { data: agent, error: agentError } = await supabase
      .from('agents')
      .select('id, status')
      .eq('user_id', user.id)
      .single();

    if (agentError) throw agentError;
    if (!agent || agent.status !== 'approved') {
      return NextResponse.json({ error: 'Approved agent account required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let query = supabase
      .from('agent_commission_records')
      .select(`
        id, status, created_at, confirmed_at, payment_recorded_at,
        landlord_rent_minor, markup_amount_minor, student_pays_minor,
        referrer_rate_bps, agent_commission_minor,
        payment_reference, payment_notes,
        unit:accommodation_units (
          id, unit_number, room_type,
          property:accommodation_properties (name, area)
        )
      `)
      .eq('agent_id', agent.id)
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: commissions, error } = await query;
    if (error) throw error;

    // Fetch all commission rows for accurate counts even when the list is filtered.
    const { data: allCommissions, error: allCommissionsError } = await supabase
      .from('agent_commission_records')
      .select('status, agent_commission_minor')
      .eq('agent_id', agent.id);

    if (allCommissionsError) throw allCommissionsError;

    const all = allCommissions || [];
    const summary = {
      total_pending: all.filter(c => c.status === 'pending_confirmation').length,
      total_confirmed: all.filter(c => ['confirmed', 'payment_recorded'].includes(c.status))
        .reduce((sum, c) => sum + c.agent_commission_minor, 0),
      total_paid: all.filter(c => c.status === 'payment_recorded')
        .reduce((sum, c) => sum + c.agent_commission_minor, 0),
    };

    return NextResponse.json({ commissions: commissions || [], summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}