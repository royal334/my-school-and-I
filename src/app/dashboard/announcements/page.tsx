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

export default async function AnnouncementsPage() {

  const supabase = createClient(await cookies());
  const { data:{ user }} = await supabase.auth.getUser();

  if(!user){
    redirect('/login');
  }

  const isAdmin = await isUserAdmin(user.id, supabase);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div>
        <div className="mb-8">
          <div className='flex justify-between items-center gap-8 md:gap-0 mb-2'>
            <h1 className="text-xl md:text-3xl" style={{ fontFamily: "var(--font-display)" }}>Announcements</h1>
            {isAdmin && (<Link href="/dashboard/announcements/send">
              <button className="bg-[#1A3C34] hover:bg-[#141F1B] text-[#E8F5EF] py-2 px-4 rounded-md font-medium transition-colors duration-200 text-sm md:text-base">
                Send Announcement
              </button>
            </Link>)}
          </div>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Stay updated with department and university announcements
          </p>
        </div>
        <div data-tour="page-announcements">
          <AnnouncementFeed />
        </div>
      </div>
    </div>
  );
}