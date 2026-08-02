import AnnouncementFeed from '@/components/announcements/announcement-feed';
import Link from 'next/link';
import { isUserAdmin } from '@/utils/supabase/queries';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';


export const metadata = {
  title: 'Announcements',
};

export const dynamic = 'force-dynamic';

export default async function AnnouncementsPage() {

  const supabase = createClient(await cookies());
  const { data:{ user }} = await supabase.auth.getUser();

  if(!user){
    redirect('/login');
  }

  const isAdmin = await isUserAdmin(user.id, supabase);


  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div>
        <div className="mb-8">
          <div className='flex justify-between items-center gap-8 md:gap-0 mb-2'>
            <h1 className="text-xl md:text-3xl font-bold text-slate-900">Announcements</h1>
            {isAdmin && (<Link href="/dashboard/announcements/send">
              <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-semibold transition-colors duration-200 text-sm md:text-base">
                Send Announcement
              </button>
            </Link>)}
          </div>
          <p className="text-slate-600 mt-2">
            Stay updated with department and university announcements
          </p>
        </div>
        <Suspense fallback={<div className="flex items-center justify-center py-12"><p className="text-sm text-slate-600">Loading announcements...</p></div>}>
          <AnnouncementFeed />
        </Suspense>
      </div>
    </div>
  );
}