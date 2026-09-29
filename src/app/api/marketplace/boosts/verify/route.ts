// app/api/marketplace/boosts/verify/route.ts
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { fromKobo, verifyPaystackTransaction } from '@/utils/lib/paystack';

function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

// GET /api/marketplace/boosts/verify?reference=xxx
// Called by Paystack after payment
export async function GET(request: Request) {
  try {
    const supabase = createClient(await cookies());
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?boost=failed`
      );
    }

    const verifyData = await verifyPaystackTransaction(reference);

    if (!verifyData.status || verifyData.data.status !== 'success') {
      // Mark boost as failed
      await supabase
        .from('marketplace_boosts')
        .update({ payment_status: 'failed' })
        .eq('paystack_reference', reference);

      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?boost=failed`
      );
    }

    const { listing_id, boost_tier, seller_id } = verifyData.data.metadata;

    const { data: boost } = await supabase
      .from('marketplace_boosts')
      .select('listing_id, seller_id, boost_tier, price_paid, duration_hours')
      .eq('paystack_reference', reference)
      .maybeSingle();

    if (
      !boost ||
      boost.listing_id !== listing_id ||
      boost.seller_id !== seller_id ||
      boost.boost_tier !== boost_tier ||
      fromKobo(verifyData.data.amount) !== Number(boost.price_paid)
    ) {
      console.error('Boost payment details do not match the pending boost:', reference);
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?boost=failed`
      );
    }

    // Calculate expiry from the duration saved when the payment was initialized.
    const hours = boost.duration_hours;
    const activatedAt = new Date();
    const expiresAt = new Date(activatedAt.getTime() + hours * 60 * 60 * 1000);

    // Activate boost
    await supabase
      .from('marketplace_boosts')
      .update({
        payment_status: 'paid',
        is_active: true,
        activated_at: activatedAt.toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .eq('paystack_reference', reference);

    // Mark listing as boosted
    await supabase
      .from('marketplace_listings')
      .update({ is_boosted: true })
      .eq('id', listing_id);

    // Send push notifications for premium/featured boosts
    if (boost_tier === 'premium' || boost_tier === 'featured') {
      const { sendBulkNotification } = await import(
        '@/utils/lib/services/notification-service'
      );

      // Get the listing details
      const { data: listing } = await supabase
        .from('marketplace_listings')
        .select('title, category, price')
        .eq('id', listing_id)
        .single();

      if (boost_tier === 'featured') {
        let recipientIds: string[] = [];

        if (listing?.category) {
          const { data: similarSaves } = await supabase
            .from('marketplace_saves')
            .select('user_id, listing:marketplace_listings!inner(category)')
            .eq('listing.category', listing.category)
            .neq('user_id', seller_id);

          const interestedUserIds = [
            ...new Set(
              (similarSaves || [])
                .map((save: { user_id: string }) => save.user_id)
                .filter((userId: string) => Boolean(userId) && userId !== seller_id),
            ),
          ];
          recipientIds = pickRandom(interestedUserIds, 150);
        }

        if (recipientIds.length < 150) {
          const { data: allUsers } = await supabase
            .from('profiles')
            .select('id')
            .neq('id', seller_id);

          const selectedIds = new Set(recipientIds);
          const randomCandidates = (allUsers || [])
            .map((user: { id: string }) => user.id)
            .filter((userId: string) => !selectedIds.has(userId));
          recipientIds.push(...pickRandom(randomCandidates, 150 - recipientIds.length));
        }

        if (recipientIds.length > 0) {
          sendBulkNotification({
            userIds: recipientIds,
            type: 'marketplace',
            title: '🌟 Featured on Marketplace',
            body: listing?.title
              ? `Check out: ${listing.title}`
              : 'A new featured listing is available on Campus&Me',
            data: {
              listing_id,
              deeplink: `/dashboard/marketplace/${listing_id}`,
            },
          }).catch(console.error);
        }
      } else if (boost_tier === 'premium') {
        // Notify users who saved similar items in same category
        if (listing?.category) {
          const { data: similarSaves } = await supabase
            .from('marketplace_saves')
            .select('user_id, listing:marketplace_listings!inner(category)')
            .eq('listing.category', listing.category)
            .neq('user_id', seller_id);

          const interestedUserIds = [
            ...new Set((similarSaves || []).map((s: any) => s.user_id)),
          ];

          if (interestedUserIds.length > 0) {
            sendBulkNotification({
              userIds: interestedUserIds,
              type: 'marketplace',
              title: '🚀 New listing in your interest',
              body: listing.title
                ? `${listing.title} — Check it out!`
                : 'A listing you might like is now available',
              data: {
                listing_id,
                deeplink: `/dashboard/marketplace/${listing_id}`,
              },
            }).catch(console.error);
          }
        }
      }
    }

    // Redirect to success page
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace/${listing_id}?boost=success`
    );
  } catch (error: any) {
    console.error('Boost verify error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/marketplace?boost=error`
    );
  }
}