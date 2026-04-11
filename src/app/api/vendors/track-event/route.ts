// app/api/vendors/track-event/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

type VendorEvent = 'view' | 'contact_phone' | 'contact_whatsapp';

export async function POST(request: Request) {
  try {
    const supabase = createClient(await cookies());

    // Get user (optional - can track anonymous)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const { vendor_id, event, metadata = {} } = body;

    if (!vendor_id || !event) {
      return NextResponse.json(
        { error: 'vendor_id and event are required' },
        { status: 400 }
      );
    }

    // Validate event type
    const validEvents: VendorEvent[] = [
      'view',
      'contact_phone',
      'contact_whatsapp',
    ];
    if (!validEvents.includes(event as VendorEvent)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Get current hour window
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setMinutes(0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setHours(periodStart.getHours() + 1);

    // Get or create hourly analytics record
    const { data: existing } = await supabase
      .from('vendor_analytics')
      .select('*')
      .eq('vendor_id', vendor_id)
      .eq('period_start', periodStart.toISOString())
      .eq('granularity', 'hour')
      .single();

    if (existing) {
      const updates: any = {};

      switch (event) {
        case 'view':
          updates.views = existing.views + 1;
          if (metadata.source) {
            const sources = existing.sources || {};
            sources[metadata.source] = (sources[metadata.source] || 0) + 1;
            updates.sources = sources;
          }
          break;

        case 'contact_phone':
          updates.phone_contacts = existing.phone_contacts + 1;
          updates.total_contacts = existing.total_contacts + 1;
          break;

        case 'contact_whatsapp':
          updates.whatsapp_contacts = existing.whatsapp_contacts + 1;
          updates.total_contacts = existing.total_contacts + 1;
          break;
      }

      const newViews = updates.views || existing.views;
      const newContacts = updates.total_contacts || existing.total_contacts;
      updates.view_to_contact_rate =
        newViews > 0 ? Number(((newContacts / newViews) * 100).toFixed(2)) : 0;

      const { error: updateError } = await supabase
        .from('vendor_analytics')
        .update(updates)
        .eq('id', existing.id);

      if (updateError) {
        console.error('Analytics update error:', updateError);
      }
    } else {
      const initialData: any = {
        vendor_id,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        granularity: 'hour',
        views: event === 'view' ? 1 : 0,
        unique_views: event === 'view' ? 1 : 0,
        phone_contacts: event === 'contact_phone' ? 1 : 0,
        whatsapp_contacts: event === 'contact_whatsapp' ? 1 : 0,
        total_contacts: event.startsWith('contact_') ? 1 : 0,
        sources: metadata.source ? { [metadata.source]: 1 } : {},
        view_to_contact_rate: 0,
      };

      const { error: insertError } = await supabase.from('vendor_analytics').insert(initialData);

      if (insertError) {
        console.error('Analytics insert error:', insertError);
      }
    }

    // Also update vendor-level counters
    if (event === 'view') {
      const { error: rpcError } = await supabase.rpc('increment', {
        table_name: 'vendors',
        row_id: vendor_id,
        column_name: 'view_count',
      });
      if (rpcError) console.error('Increment view_count error:', rpcError);
    } else if (event.startsWith('contact_')) {
      // Track contact
      if (user) {
        await supabase.from('vendor_contacts').insert({
          vendor_id,
          user_id: user.id,
          contact_type: event === 'contact_phone' ? 'phone' : 'whatsapp',
        });
      }

      const { error: rpcError } = await supabase.rpc('increment', {
        table_name: 'vendors',
        row_id: vendor_id,
        column_name: 'contact_count',
      });
      if (rpcError) console.error('Increment contact_count error:', rpcError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Event tracking error:', error);
    // Don't fail - analytics should never break the app
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
