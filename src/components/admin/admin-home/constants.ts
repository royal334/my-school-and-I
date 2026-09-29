import type { LucideIcon } from 'lucide-react';
import { Building2, Store } from 'lucide-react';

export interface AdminSection {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  features: string[];
}

/** Every admin area reachable from the `/admin` hub. */
export const ADMIN_SECTIONS: AdminSection[] = [
  {
    href: '/admin/accommodation',
    title: 'Accommodation',
    description:
      'Review student leads, verify listings, manage viewings and referral rewards.',
    icon: Building2,
    features: ['Leads', 'Listings', 'Viewings', 'Referrals'],
  },
  {
    href: '/admin/marketplace',
    title: 'Marketplace',
    description: 'Moderate listings, resolve user reports and manage boosted posts.',
    icon: Store,
    features: ['Listings', 'Reports', 'Boosts', 'Stats'],
  },
];
