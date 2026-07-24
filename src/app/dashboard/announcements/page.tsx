import AnnouncementFeed from '@/components/announcements/announcement-feed';

export const metadata = {
  title: 'Announcements',
};

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-600 mt-2">
            Stay updated with department and university announcements
          </p>
        </div>
        <AnnouncementFeed />
      </div>
    </div>
  );
}