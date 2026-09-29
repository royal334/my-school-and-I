import type { Metadata } from 'next';
import { AdminMarketplaceDashboard } from '@/components/admin/marketplace/admin-marketplace-dashboard';

export const metadata: Metadata = {
  title: 'Admin · Marketplace',
};

export default function AdminMarketplacePage() {
  return <AdminMarketplaceDashboard />;
}
