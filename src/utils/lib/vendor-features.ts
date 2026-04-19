export type VendorTier = 'basic' | 'premium' | 'featured';

export interface Vendor {
  subscription_tier: VendorTier;
  subscription_expires_at?: string | null;
  subscription_auto_renew?: boolean;
}

export interface VendorFeatures {
  // Current tier info
  tier: VendorTier;
  isActive: boolean;
  isExpired: boolean;
  daysUntilExpiry: number | null;
  
  // Visual branding
  canUploadLogo: boolean;
  canUploadCover: boolean;
  canAddGallery: boolean;
  maxGalleryImages: number;
  canCustomizeTheme: boolean;
  canAddSocialLinks: boolean;
  
  // Visibility & ranking
  searchPriority: number; // 1 (basic) | 5 (premium) | 10 (featured)
  isFeatured: boolean;
  hasVerifiedBadge: boolean;
  isPremium: boolean;
  showsInHomepageSpotlight: boolean;
  showsInFeaturedSection: boolean;
  
  // Services
  maxServices: number;
  canHaveUnlimitedServices: boolean;
  
  // Locations
  maxLocations: number;
  
  // Analytics
  hasBasicAnalytics: boolean;
  hasContactAnalytics: boolean;
  hasAdvancedAnalytics: boolean;
  analyticsGranularity: 'hour' | 'day' | 'month';
  hasTrafficSources: boolean;
  hasCompetitorInsights: boolean;
  hasPeakTimeAnalysis: boolean;
  hasConversionTracking: boolean;
  
  // Communication
  hasSMSCredits: boolean;
  smsCreditsPerMonth: number;
  hasQuickReplyTemplates: boolean;
  maxQuickReplyTemplates: number;
  canRespondToReviews: boolean;
  
  // Support
  supportLevel: 'community' | 'email' | 'priority';
  supportResponseTime: string;
  
  // Badges & indicators
  badges: Array<'premium' | 'featured' | 'verified'>;
}

export function getVendorFeatures(vendor: Vendor): VendorFeatures {
  // Check if subscription is active
  const isActive = checkSubscriptionActive(vendor);
  const effectiveTier = isActive ? vendor.subscription_tier : 'basic';
  
  // Calculate days until expiry
  const daysUntilExpiry = vendor.subscription_expires_at
    ? Math.ceil(
        (new Date(vendor.subscription_expires_at).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  
  const isExpired = daysUntilExpiry !== null && daysUntilExpiry <= 0;
  
  // Define features based on tier
  const features: VendorFeatures = {
    tier: effectiveTier,
    isActive,
    isExpired,
    daysUntilExpiry,
    
    // Visual branding
    canUploadLogo: effectiveTier !== 'basic',
    canUploadCover: effectiveTier !== 'basic',
    canAddGallery: effectiveTier !== 'basic',
    maxGalleryImages: effectiveTier === 'featured' ? 10 : effectiveTier === 'premium' ? 5 : 0,
    canCustomizeTheme: effectiveTier === 'featured',
    canAddSocialLinks: effectiveTier === 'featured',
    
    // Visibility & ranking
    searchPriority: effectiveTier === 'featured' ? 10 : effectiveTier === 'premium' ? 5 : 1,
    isFeatured: effectiveTier === 'featured',
    hasVerifiedBadge: effectiveTier === 'featured',
    isPremium: effectiveTier === 'premium' || effectiveTier === 'featured',
    showsInHomepageSpotlight: effectiveTier === 'featured',
    showsInFeaturedSection: effectiveTier !== 'basic',
    
    // Services
    maxServices: effectiveTier === 'featured' ? 999 : effectiveTier === 'premium' ? 10 : 5,
    canHaveUnlimitedServices: effectiveTier === 'featured',
    
    // Locations
    maxLocations: effectiveTier === 'featured' ? 3 : 1,
    
    // Analytics
    hasBasicAnalytics: true,
    hasContactAnalytics: effectiveTier !== 'basic',
    hasAdvancedAnalytics: effectiveTier === 'featured',
    analyticsGranularity: effectiveTier === 'featured' ? 'hour' : effectiveTier === 'premium' ? 'day' : 'month',
    hasTrafficSources: effectiveTier === 'featured',
    hasCompetitorInsights: effectiveTier === 'featured',
    hasPeakTimeAnalysis: effectiveTier === 'featured',
    hasConversionTracking: effectiveTier !== 'basic',
    
    // Communication
    hasSMSCredits: effectiveTier === 'featured',
    smsCreditsPerMonth: effectiveTier === 'featured' ? 500 : 0,
    hasQuickReplyTemplates: effectiveTier !== 'basic',
    maxQuickReplyTemplates: effectiveTier === 'featured' ? 999 : effectiveTier === 'premium' ? 5 : 0,
    canRespondToReviews: effectiveTier === 'featured',
    
    // Support
    supportLevel: effectiveTier === 'featured' ? 'priority' : effectiveTier === 'premium' ? 'email' : 'community',
    supportResponseTime: effectiveTier === 'featured' ? '24 hours' : effectiveTier === 'premium' ? '48 hours' : 'Community support',
    
    // Badges
    badges: getBadges(effectiveTier),
  };
  
  return features;
}

// Helper: Check if subscription is active
export function checkSubscriptionActive(vendor: Vendor): boolean {
  // Basic tier is always active
  if (vendor.subscription_tier === 'basic') return true;
  
  // Check expiration
  if (!vendor.subscription_expires_at) return false;
  
  const expiryDate = new Date(vendor.subscription_expires_at);
  const now = new Date();
  
  return expiryDate > now;
}

// Helper: Get badges for tier
export function getBadges(tier: VendorTier): Array<'premium' | 'featured' | 'verified'> {
  const badges: Array<'premium' | 'featured' | 'verified'> = [];
  
  if (tier === 'premium') {
    badges.push('premium');
  }
  
  if (tier === 'featured') {
    badges.push('featured', 'verified');
  }
  
  return badges;
}
