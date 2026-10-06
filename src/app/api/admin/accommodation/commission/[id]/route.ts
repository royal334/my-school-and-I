// app/api/admin/accommodation/commissions/[id]/route.ts
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

// PATCH /api/admin/accommodation/commissions/[id]
// Actions: confirm, record_payment, dispute, cancel
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = createClient(await cookies());
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !(await isAdmin(supabase, user.id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, payment_reference, payment_notes } = body;

    // Get current commission record
    const { data: existing } = await supabase
      .from('agent_commission_records')
      .select(`
        id, status, agent_id, agent_commission_minor,
        agent:agent_id(user_id, display_name)
      `)
      .eq('id', id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: 'Commission record not found' }, { status: 404 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // ── Action: confirm ─────────────────────────────────────────────────────
    if (action === 'confirm') {
      if (existing.status !== 'pending_confirmation') {
        return NextResponse.json(
          { error: `Cannot confirm a commission with status: ${existing.status}` },
          { status: 400 }
        );
      }
      updates.status = 'confirmed';
      updates.confirmed_at = new Date().toISOString();
      updates.confirmed_by = user.id;
    }

    // ── Action: record_payment ──────────────────────────────────────────────
    if (action === 'record_payment') {
      if (!['confirmed'].includes(existing.status)) {
        return NextResponse.json(
          { error: 'Commission must be confirmed before recording payment' },
          { status: 400 }
        );
      }
      updates.status = 'payment_recorded';
      updates.payment_recorded_at = new Date().toISOString();
      updates.payment_recorded_by = user.id;
      updates.payment_reference = payment_reference || null;
      updates.payment_notes = payment_notes || null;

      // Also create a commission_payment_records entry
      await supabase.from('commission_payment_records').insert({
        commission_record_id: id,
        amount_minor: existing.agent_commission_minor,
        status: 'recorded',
        paid_at: new Date().toISOString(),
        payment_reference: payment_reference || null,
        recorded_by: user.id,
        notes: payment_notes || null,
      });
    }

    // ── Action: dispute ────────────────────────────────────────────────────
    if (action === 'dispute') {
      updates.status = 'disputed';
    }

    // ── Action: cancel ─────────────────────────────────────────────────────
    if (action === 'cancel') {
      updates.status = 'cancelled';
    }

    const { data: commission, error } = await supabase
      .from('agent_commission_records')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log audit event
    await supabase.from('agent_audit_events').insert({
      agent_id: existing.agent_id,
      actor_user_id: user.id,
      event_type: action === 'record_payment' ? 'payment_recorded' : 'commission_adjusted',
      entity_type: 'commission',
      entity_id: id,
      metadata: {
        action,
        old_status: existing.status,
        new_status: updates.status,
        payment_reference: payment_reference || null,
      },
    });

    // Notify agent on confirm or payment recorded
    if (action === 'confirm' || action === 'record_payment') {
      const { sendNotification } = await import(
        '@/utils/lib/services/notification-service'
      );

      const formatNaira = (minor: number) =>
        new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 })
          .format(minor / 100);

      const messages: Record<string, { title: string; body: string }> = {
        confirm: {
          title: '✅ Commission confirmed',
          body: `Your commission of ${formatNaira(existing.agent_commission_minor)} has been confirmed.`,
        },
        record_payment: {
          title: '💰 Commission payment recorded',
          body: `Payment of ${formatNaira(existing.agent_commission_minor)} has been recorded. This is a platform record — not a live bank confirmation.`,
        },
      };

      const msg = messages[action];
      const agent = Array.isArray(existing.agent) ? existing.agent[0] : existing.agent;

      if (msg && agent?.user_id) {
        sendNotification({
          userId: agent.user_id,
          type: 'accommodation',
          title: msg.title,
          body: msg.body,
          data: {
            commission_id: id,
            deeplink: '/agent/commissions',
          },
        }).catch(console.error);
      }
    }

    return NextResponse.json({ success: true, commission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}