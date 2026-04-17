// app/api/vendors/track-event/route.ts
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type VendorEvent = "view" | "contact_phone" | "contact_whatsapp";

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
        { error: "vendor_id and event are required" },
        { status: 400 },
      );
    }

    // Validate event type
    const validEvents: VendorEvent[] = [
      "view",
      "contact_phone",
      "contact_whatsapp",
    ];
    if (!validEvents.includes(event as VendorEvent)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 },
      );
    }

    // Get current hour window
    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setMinutes(0, 0, 0);

    const periodEnd = new Date(periodStart);
    periodEnd.setHours(periodStart.getHours() + 1);

    // Delegate the upsert to a Postgres function so that the ON CONFLICT
    // DO UPDATE clause can use arithmetic (vendor_analytics.views + EXCLUDED.views)
    // rather than a plain replacement — making this truly atomic under concurrency.
    // See: supabase/migrations/upsert_vendor_analytics.sql
    const isView = event === "view";
    const isPhone = event === "contact_phone";
    const isWhatsapp = event === "contact_whatsapp";
    const isContact = isPhone || isWhatsapp;

    const { error: analyticsError } = await supabase.rpc(
      "upsert_vendor_analytics",
      {
        p_vendor_id: vendor_id,
        p_period_start: periodStart.toISOString(),
        p_period_end: periodEnd.toISOString(),
        p_granularity: "hour",
        p_views: isView ? 1 : 0,
        p_unique_views: isView ? 1 : 0,
        p_phone_contacts: isPhone ? 1 : 0,
        p_whatsapp_contacts: isWhatsapp ? 1 : 0,
        p_total_contacts: isContact ? 1 : 0,
        // Only track sources for view events
        p_source:
          isView && metadata.source ? (metadata.source as string) : null,
      },
    );

    if (analyticsError) {
      return NextResponse.json(
        {
          error: "Failed to record analytics event",
          details: analyticsError.message,
        },
        { status: 500 },
      );
    }

    // Also update vendor-level counters
    if (event === "view") {
      const { error: rpcError } = await supabase.rpc("increment", {
        table_name: "vendors",
        row_id: vendor_id,
        column_name: "view_count",
      });
      if (rpcError) console.error("Increment view_count error:", rpcError);
    } else if (event.startsWith("contact_")) {
      // Track contact
      if (user) {
        const { error: contactInsertError } = await supabase
          .from("vendor_contacts")
          .insert({
            vendor_id,
            user_id: user.id,
            contact_type: event === "contact_phone" ? "phone" : "whatsapp",
          });

        if (contactInsertError) {
          console.error("vendor_contacts insert error:", {
            error: contactInsertError,
            vendor_id,
            user_id: user.id,
          });
          return NextResponse.json(
            {
              error: "Failed to record contact event",
              details: contactInsertError.message,
            },
            { status: 500 },
          );
        }
      }

      const { error: viewRpcError } = await supabase.rpc(
        "increment_vendor_view",
        {
          vendor_id: vendor_id,
        },
      );

      // For contacts
      const { error: contactRpcError } = await supabase.rpc(
        "increment_vendor_contact",
        {
          vendor_id: vendor_id,
        },
      );
      if (viewRpcError || contactRpcError)
        console.error("Increment rpc error:", viewRpcError, contactRpcError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Event tracking error:", error);
    // Don't fail - analytics should never break the app
    return NextResponse.json({ success: false }, { status: 200 });
  }
}
