import type { BoostTier, MarketplaceSort } from '@/components/marketplace/types';

export const CATEGORIES = [
  { key: 'all', label: 'All', emoji: '🛍️' },
  { key: 'electronics', label: 'Electronics', emoji: '📱' },
  { key: 'books', label: 'Books', emoji: '📚' },
  { key: 'fashion', label: 'Fashion', emoji: '👕' },
  { key: 'furniture', label: 'Furniture', emoji: '🪑' },
  { key: 'gaming', label: 'Gaming', emoji: '🎮' },
  { key: 'hostel_items', label: 'Hostel', emoji: '🏠' },
  { key: 'beauty', label: 'Beauty', emoji: '💄' },
  { key: 'kitchen', label: 'Kitchen', emoji: '🍳' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

export const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'for_parts'] as const;

export const CONDITION_LABELS: Record<string, string> = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  for_parts: 'For Parts / Repair',
};

export const SELLER_TYPE_OPTIONS = [
  { key: '', label: 'All' },
  { key: 'student', label: '🎓 Students' },
  { key: 'vendor', label: '🏪 Vendors' },
];

export const SORT_OPTIONS: { value: MarketplaceSort; label: string }[] = [
  { value: 'recent', label: 'Most recent' },
  { value: 'price_asc', label: 'Price: Low to high' },
  { value: 'price_desc', label: 'Price: High to low' },
];

export const REPORT_REASONS = [
  { key: 'scam', label: '⚠️ Scam or fraud' },
  { key: 'fake_product', label: '❌ Fake product' },
  { key: 'prohibited', label: '🚫 Prohibited item' },
  { key: 'misleading', label: '📝 Misleading information' },
  { key: 'inappropriate', label: '🔞 Inappropriate content' },
  { key: 'other', label: '📌 Other' },
];

/** Categories accepted by the sell form (everything except the "all" filter). */
export const LISTING_CATEGORIES = CATEGORIES.filter((category) => category.key !== 'all');

const CONDITION_DESCRIPTIONS: Record<string, string> = {
  new: 'Never used, original packaging',
  like_new: 'Used once or twice, no visible wear',
  good: 'Minor signs of use, fully functional',
  fair: 'Visible wear, still works fine',
  for_parts: 'Not fully functional',
};

export const LISTING_CONDITION_OPTIONS = CONDITIONS.map((key) => ({
  key,
  label: CONDITION_LABELS[key],
  desc: CONDITION_DESCRIPTIONS[key] ?? '',
}));

/** Condition pill tones, mapped onto the app's semantic colour tokens. */
const CONDITION_TONES: Record<string, string> = {
  new: 'bg-success-bg text-success-text',
  like_new: 'bg-info-bg text-info-text',
  good: 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300',
  fair: 'bg-warning-bg text-warning-text',
  for_parts: 'bg-error-bg text-error-text',
};

export const LISTING_STATUS_TONES: Record<string, { label: string; tone: string }> = {
  active: { label: 'Active', tone: 'bg-success-bg text-success-text' },
  sold: { label: 'Sold', tone: 'bg-info-bg text-info-text' },
  archived: { label: 'Archived', tone: 'bg-muted text-muted-foreground' },
  expired: { label: 'Expired', tone: 'bg-error-bg text-error-text' },
  draft: { label: 'Draft', tone: 'bg-warning-bg text-warning-text' },
};

export const MY_LISTINGS_TABS = [
  { key: 'active', label: 'Active' },
  { key: 'sold', label: 'Sold' },
  { key: 'archived', label: 'Archived' },
  { key: 'expired', label: 'Expired' },
  { key: 'all', label: 'All' },
] as const;

export const SELL_STEPS = ['Details', 'Condition & Price', 'Photos'] as const;

export const MAX_LISTING_IMAGES = 5;

export const DEFAULT_LISTING_DRAFT = {
  title: '',
  description: '',
  category: '',
  condition: '',
  price: '',
  negotiable: false,
  location: '',
  isUrgent: false,
};

export const BOOST_TIERS: BoostTier[] = [
  {
    key: 'standard',
    label: 'Standard Boost',
    emoji: '⚡',
    price: 500,
    duration: '24 hours',
    hours: 24,
    features: [
      'Appears in Promoted section on feed',
      '🔥 Promoted badge on listing card',
      'Higher visibility for 24 hours',
    ],
    accent: 'text-primary-700 dark:text-primary-300',
    surface: 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-500/10',
  },
  {
    key: 'premium',
    label: 'Premium Boost',
    emoji: '🚀',
    price: 1500,
    duration: '3 days',
    hours: 72,
    features: [
      'Everything in Standard',
      'Top of category page',
      'Push notification to users who saved similar items',
      'Priority placement for 3 days',
    ],
    accent: 'text-info-text',
    surface: 'border-info/30 bg-info-bg',
    popular: true,
  },
  {
    key: 'featured',
    label: 'Featured Boost',
    emoji: '🌟',
    price: 3000,
    duration: '7 days',
    hours: 168,
    features: [
      'Everything in Premium',
      'All category pages',
      'Push notification to marketplace users',
      '⭐ Featured badge on listing',
    ],
    accent: 'text-accent-700 dark:text-accent-400',
    surface: 'border-accent-300 bg-accent-50 dark:border-accent-600/50 dark:bg-accent-500/10',
  },
];

export function getCategoryEmoji(category: string): string {
  return CATEGORIES.find((c) => c.key === category)?.emoji || '📦';
}

export function getConditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] || condition;
}

export function getConditionTone(condition: string): string {
  return CONDITION_TONES[condition] ?? 'bg-muted text-muted-foreground';
}

export function getStatusTone(status: string): { label: string; tone: string } {
  return LISTING_STATUS_TONES[status] ?? LISTING_STATUS_TONES.active;
}
