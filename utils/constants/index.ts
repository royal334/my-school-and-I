// lib/constants/index.ts
// Application-wide constants

// ============================================================
// FILE UPLOAD LIMITS
// ============================================================

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = ['application/pdf'];
export const ALLOWED_FILE_EXTENSIONS = ['.pdf'];

// ============================================================
// DOWNLOAD LIMITS
// ============================================================

export const DAILY_DOWNLOAD_LIMIT = 10;
export const HOURLY_DOWNLOAD_LIMIT = 3;
export const MAX_UPLOADS_PER_DAY = 5;

// ============================================================
// SUBSCRIPTION PRICING (in Naira)
// ============================================================

export const PRICING = {
  SEMESTER_SUBSCRIPTION: 400, // ₦400 per semester
  VENDOR_BASIC: 5000, // ₦5,000 for basic listing
  VENDOR_PREMIUM: 10000, // ₦10,000 for premium listing
  VENDOR_FEATURED: 15000, // ₦15,000 for featured listing
} as const;

// Paystack expects amount in kobo (smallest currency unit)
export const PRICING_KOBO = {
  SEMESTER_SUBSCRIPTION: PRICING.SEMESTER_SUBSCRIPTION * 100,
  VENDOR_BASIC: PRICING.VENDOR_BASIC * 100,
  VENDOR_PREMIUM: PRICING.VENDOR_PREMIUM * 100,
  VENDOR_FEATURED: PRICING.VENDOR_FEATURED * 100,
} as const;

// ============================================================
// GRADE SYSTEM (Nigerian 5-point scale)
// ============================================================

export const GRADE_POINTS: Record<string, number> = {
  A: 5.0,
  B: 4.0,
  C: 3.0,
  D: 2.0,
  E: 1.0,
  F: 0.0,
};

export const GRADES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

export const GRADE_DESCRIPTIONS: Record<string, string> = {
  A: 'Excellent (70-100)',
  B: 'Very Good (60-69)',
  C: 'Good (50-59)',
  D: 'Fair (45-49)',
  E: 'Pass (40-44)',
  F: 'Fail (0-39)',
};

// ============================================================
// ACADEMIC LEVELS
// ============================================================

export const LEVELS = [100, 200, 300, 400, 500] as const;

export const LEVEL_NAMES: Record<number, string> = {
  100: '100 Level',
  200: '200 Level',
  300: '300 Level',
  400: '400 Level',
  500: '500 Level',
};

// ============================================================
// SEMESTERS
// ============================================================

export const SEMESTERS = [1, 2] as const;

export const SEMESTER_NAMES: Record<number, string> = {
  1: 'First Semester',
  2: 'Second Semester',
};

// ============================================================
// MATERIAL TYPES
// ============================================================

export const MATERIAL_TYPES = [
  'lecture_note',
  'past_question',
  'textbook',
  'assignment',
  'lab_manual',
  'other',
] as const;

export const MATERIAL_TYPE_LABELS: Record<string, string> = {
  lecture_note: 'Lecture Note',
  past_question: 'Past Question',
  textbook: 'Textbook',
  assignment: 'Assignment',
  lab_manual: 'Lab Manual',
  other: 'Other',
};

export const MATERIAL_TYPE_ICONS: Record<string, string> = {
  lecture_note: '📝',
  past_question: '📄',
  textbook: '📚',
  assignment: '✍️',
  lab_manual: '🔬',
  other: '📋',
};

// ============================================================
// ANNOUNCEMENT TYPES
// ============================================================

export const ANNOUNCEMENT_TYPES = [
  'general',
  'urgent',
  'academic',
  'event',
  'maintenance',
] as const;

export const ANNOUNCEMENT_TYPE_LABELS: Record<string, string> = {
  general: 'General',
  urgent: 'Urgent',
  academic: 'Academic',
  event: 'Event',
  maintenance: 'Maintenance',
};

export const ANNOUNCEMENT_TYPE_COLORS: Record<string, string> = {
  general: 'bg-blue-100 text-blue-800',
  urgent: 'bg-red-100 text-red-800',
  academic: 'bg-purple-100 text-purple-800',
  event: 'bg-green-100 text-green-800',
  maintenance: 'bg-yellow-100 text-yellow-800',
};

// ============================================================
// USER ROLES
// ============================================================

export const USER_ROLES = [
  'super_admin',
  'admin',
  'moderator',
  'content_manager',
] as const;

export const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  moderator: 'Moderator',
  content_manager: 'Content Manager',
};

export const ROLE_PERMISSIONS: Record<
  string,
  {
    canApprove: boolean;
    canDelete: boolean;
    canManageUsers: boolean;
    canViewAnalytics: boolean;
  }
> = {
  super_admin: {
    canApprove: true,
    canDelete: true,
    canManageUsers: true,
    canViewAnalytics: true,
  },
  admin: {
    canApprove: true,
    canDelete: true,
    canManageUsers: true,
    canViewAnalytics: true,
  },
  moderator: {
    canApprove: true,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: false,
  },
  content_manager: {
    canApprove: false,
    canDelete: false,
    canManageUsers: false,
    canViewAnalytics: false,
  },
};

// ============================================================
// VENDOR CATEGORIES (Default categories)
// ============================================================

export const DEFAULT_VENDOR_CATEGORIES = [
  { name: 'Printing & Binding', icon: '🖨️' },
  { name: 'Typing Services', icon: '⌨️' },
  { name: 'Phone & Computer Repairs', icon: '🔧' },
  { name: 'Photocopying', icon: '📋' },
  { name: 'Stationery', icon: '✏️' },
  { name: 'Food & Snacks', icon: '🍔' },
  { name: 'Laundry Services', icon: '🧺' },
  { name: 'Tutoring', icon: '👨‍🏫' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Other Services', icon: '🛠️' },
] as const;

// ============================================================
// SUBSCRIPTION TIERS
// ============================================================

export const SUBSCRIPTION_TIERS = ['basic', 'premium', 'featured'] as const;

export const TIER_LABELS: Record<string, string> = {
  basic: 'Basic',
  premium: 'Premium',
  featured: 'Featured',
};

export const TIER_FEATURES: Record<string, string[]> = {
  basic: ['Basic listing', 'Contact information', 'Basic description'],
  premium: [
    'Everything in Basic',
    'Logo upload',
    'Cover image',
    'Extended description',
    'Operating hours',
  ],
  featured: [
    'Everything in Premium',
    'Featured badge',
    'Top of search results',
    'Social media links',
    'Priority support',
  ],
};

// ============================================================
// WATERMARK SETTINGS
// ============================================================

export const WATERMARK_CONFIG = {
  FONT_SIZE: 40,
  OPACITY: 0.3,
  COLOR: [0.7, 0.7, 0.7] as [number, number, number],
  ROTATION: -45,
  FOOTER_FONT_SIZE: 8,
  FOOTER_OPACITY: 0.5,
} as const;

// ============================================================
// PAGINATION
// ============================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  MATERIALS_PER_PAGE: 12,
  VENDORS_PER_PAGE: 12,
  TRANSACTIONS_PER_PAGE: 20,
} as const;

// ============================================================
// DATE FORMATS
// ============================================================

export const DATE_FORMATS = {
  SHORT: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  WITH_TIME: 'MMM d, yyyy h:mm a',
  TIME_ONLY: 'h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
} as const;

// ============================================================
// URLS
// ============================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  MATERIALS: '/dashboard/materials',
  CGPA: '/dashboard/cgpa',
  VENDORS: '/dashboard/vendors',
  ANNOUNCEMENTS: '/dashboard/announcements',
  PROFILE: '/dashboard/profile',
  ADMIN: '/admin',
  ADMIN_MATERIALS: '/admin/materials',
  ADMIN_VENDORS: '/admin/vendors',
  ADMIN_ANALYTICS: '/admin/analytics',
} as const;

// ============================================================
// API ENDPOINTS
// ============================================================

export const API_ROUTES = {
  AUTH: {
    SIGNUP: '/api/auth/signup',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    VERIFY: '/api/auth/verify-email',
    RESET: '/api/auth/reset-password',
  },
  MATERIALS: {
    LIST: '/api/materials',
    DETAIL: '/api/materials/[id]',
    DOWNLOAD: '/api/materials/download/[id]',
    UPLOAD: '/api/materials/upload',
  },
  CGPA: {
    SEMESTERS: '/api/cgpa/semesters',
    CALCULATE: '/api/cgpa/calculate',
    EXPORT: '/api/cgpa/export',
  },
  VENDORS: {
    LIST: '/api/vendors',
    DETAIL: '/api/vendors/[id]',
    REVIEW: '/api/vendors/review',
  },
  PAYMENTS: {
    INITIALIZE: '/api/payments/initialize',
    VERIFY: '/api/payments/verify',
    WEBHOOK: '/api/payments/webhook',
  },
} as const;

// ============================================================
// VALIDATION RULES
// ============================================================

export const VALIDATION = {
  MATRIC_NUMBER: {
    MIN_LENGTH: 5,
    MAX_LENGTH: 20,
    PATTERN: /^[A-Z]{2,4}\/\d{4}\/\d{3,4}$/i,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 100,
  },
  PHONE_NUMBER: {
    PATTERN: /^(\+234|0)[789]\d{9}$/,
  },
  BUSINESS_NAME: {
    MIN_LENGTH: 3,
    MAX_LENGTH: 100,
  },
  COURSE_CODE: {
    PATTERN: /^[A-Z]{3}\s?\d{3}$/i,
  },
} as const;

// ============================================================
// ERROR MESSAGES
// ============================================================

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'Resource not found.',
  FILE_TOO_LARGE: `File size must not exceed ${MAX_FILE_SIZE_MB}MB.`,
  INVALID_FILE_TYPE: 'Only PDF files are allowed.',
  DAILY_LIMIT_REACHED: 'You have reached your daily download limit.',
  SUBSCRIPTION_REQUIRED: 'This material requires an active subscription.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'An account with this email already exists.',
  MATRIC_EXISTS: 'An account with this matric number already exists.',
} as const;

// ============================================================
// SUCCESS MESSAGES
// ============================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  SIGNUP: 'Account created successfully! Please check your email to verify.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  MATERIAL_UPLOADED: 'Material uploaded successfully. Awaiting approval.',
  VENDOR_CREATED: 'Vendor listing created. Awaiting approval.',
  REVIEW_SUBMITTED: 'Review submitted. Awaiting approval.',
  PAYMENT_SUCCESS: 'Payment successful! Your subscription is now active.',
  SEMESTER_SAVED: 'Semester data saved successfully.',
} as const;

// ============================================================
// CACHE KEYS (for React Query)
// ============================================================

export const CACHE_KEYS = {
  MATERIALS: 'materials',
  MATERIAL: 'material',
  PROFILE: 'profile',
  COURSES: 'courses',
  SEMESTERS: 'semesters',
  VENDORS: 'vendors',
  VENDOR: 'vendor',
  ANNOUNCEMENTS: 'announcements',
  TRANSACTIONS: 'transactions',
  VENDOR_CATEGORIES: 'vendor-categories',
} as const;

// ============================================================
// THEME COLORS
// ============================================================

export const THEME = {
  PRIMARY: '#1e40af', // Deep blue
  SECONDARY: '#16a34a', // Muted green
  ACCENT: '#f59e0b', // Amber
  SUCCESS: '#10b981', // Green
  WARNING: '#f59e0b', // Amber
  ERROR: '#ef4444', // Red
  INFO: '#3b82f6', // Blue
} as const;