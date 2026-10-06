import type { LucideIcon } from 'lucide-react';
import { BookOpen, Building2, Store, UserRound, WalletCards } from 'lucide-react';

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
    href: '/admin/accommodation/agents',
    title: 'Agent applications',
    description: 'Review and manage accommodation agent applications.',
    icon: UserRound,
    features: ['Applications', 'Verification', 'Approval'],
  },
  {
    href: '/admin/accommodation/commissions',
    title: 'Agent commissions',
    description: 'Review commission records and track recorded payments.',
    icon: WalletCards,
    features: ['Confirmations', 'Payments', 'Disputes'],
  },
  {
    href: '/admin/marketplace',
    title: 'Marketplace',
    description: 'Moderate listings, resolve user reports and manage boosted posts.',
    icon: Store,
    features: ['Listings', 'Reports', 'Boosts', 'Stats'],
  },
  {
    href: '/admin/materials',
    title: 'Materials',
    description: 'Review student submissions, publish uploads and curate the library.',
    icon: BookOpen,
    features: ['Submissions', 'Library', 'Uploads', 'Stats'],
  },
];
