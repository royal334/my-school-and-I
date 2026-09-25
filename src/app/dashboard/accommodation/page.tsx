import { cookies } from 'next/headers';
import { AccommodationHeader } from '@/components/accommodation/accommodation-header';
import { AccommodationListings } from '@/components/accommodation/accommodation-listings';
import { createClient } from '@/utils/supabase/server';

export const metadata = {
  title: 'Accommodation | CampusHub',
};

export default async function AccommodationPage() {
  const supabase = createClient(await cookies());

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Show the "My Submissions" button only when the user has submitted a vacancy.
  let hasSubmissions = false;
  if (user) {
    const { data: submission } = await supabase
      .from('accommodation_submissions')
      .select('id')
      .eq('submitted_by', user.id)
      .limit(1)
      .maybeSingle();
    hasSubmissions = Boolean(submission);
  }

  return (
    <div className="space-y-6 overflow-x-hidden">
      <AccommodationHeader hasSubmissions={hasSubmissions} />
      <AccommodationListings />
    </div>
  );
}