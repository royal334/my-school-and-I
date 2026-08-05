// lib/analytics/events.ts
/**
 * Central place to define all analytics events
 * Import this and use the events throughout your app
 */

import { usePostHog } from 'posthog-js/react';

export function useAnalytics() {
  const posthog = usePostHog();

  return {
    // ==========================================
    // AUTHENTICATION EVENTS
    // ==========================================

    trackSignUp: (accountType: string) => {
      posthog?.capture('user_signed_up', {
        account_type: accountType,
      });
    },

    trackLogIn: () => {
      posthog?.capture('user_logged_in');
    },

    trackLogOut: () => {
      posthog?.capture('user_logged_out');
    },

    // ==========================================
    // ANNOUNCEMENT EVENTS
    // ==========================================

    trackAnnouncementViewed: (announcementId: string, priority: string) => {
      posthog?.capture('announcement_viewed', {
        announcement_id: announcementId,
        priority,
      });
    },

    trackAnnouncementCreated: (data: {
      scope: string;
      type: string;
      category?: string;
      priority: string;
    }) => {
      posthog?.capture('announcement_created', {
        scope: data.scope,
        type: data.type,
        category: data.category,
        priority: data.priority,
      });
    },

    trackAnnouncementSaved: (announcementId: string) => {
      posthog?.capture('announcement_saved', {
        announcement_id: announcementId,
      });
    },

    trackAnnouncementUnsaved: (announcementId: string) => {
      posthog?.capture('announcement_unsaved', {
        announcement_id: announcementId,
      });
    },

    trackAnnouncementMarkedRead: (announcementId: string) => {
      posthog?.capture('announcement_marked_read', {
        announcement_id: announcementId,
      });
    },

    trackAnnouncementShared: (announcementId: string, channel: string) => {
      posthog?.capture('announcement_shared', {
        announcement_id: announcementId,
        channel, // 'whatsapp', 'email', 'copy', etc
      });
    },

    // ==========================================
    // VENDOR EVENTS
    // ==========================================

    trackVendorListingCreated: (data: {
      business_name: string;
      category: string;
    }) => {
      posthog?.capture('vendor_listing_created', {
        business_name: data.business_name,
        category: data.category,
      });
    },

    trackVendorAnalyticsViewed: () => {
      posthog?.capture('vendor_analytics_viewed');
    },

    trackSubscriptionUpgraded: (data: {
      from: string;
      to: string;
      amount: number;
    }) => {
      posthog?.capture('subscription_upgraded', {
        from_tier: data.from,
        to_tier: data.to,
        amount: data.amount,
      });
    },

    trackSubscriptionDowngraded: (data: {
      from: string;
      to: string;
    }) => {
      posthog?.capture('subscription_downgraded', {
        from_tier: data.from,
        to_tier: data.to,
      });
    },

    trackSubscriptionCancelled: (data: {
      tier: string;
      reason?: string;
    }) => {
      posthog?.capture('subscription_cancelled', {
        tier: data.tier,
        reason: data.reason,
      });
    },

    trackVendorContacted: (data: {
      vendor_id: string;
      method: 'phone' | 'whatsapp';
    }) => {
      posthog?.capture('vendor_contacted', {
        vendor_id: data.vendor_id,
        method: data.method,
      });
    },

    // ==========================================
    // SEARCH & FILTER EVENTS
    // ==========================================

    trackSearchPerformed: (data: {
      query: string;
      results_count: number;
      section: string; // 'announcements', 'vendors', 'materials'
    }) => {
      posthog?.capture('search_performed', {
        query: data.query,
        results_count: data.results_count,
        section: data.section,
      });
    },

    trackFilterApplied: (data: {
      filter_type: string;
      filter_value: string;
      section: string;
    }) => {
      posthog?.capture('filter_applied', {
        filter_type: data.filter_type,
        filter_value: data.filter_value,
        section: data.section,
      });
    },

    // ==========================================
    // MATERIAL EVENTS (if you have materials)
    // ==========================================

    trackMaterialDownloaded: (data: {
      material_id: string;
      category: string;
      department: string;
    }) => {
      posthog?.capture('material_downloaded', {
        material_id: data.material_id,
        category: data.category,
        department: data.department,
      });
    },

    // ==========================================
    // ERROR EVENTS (manual error tracking)
    // ==========================================

    trackError: (data: {
      error_type: string;
      error_message: string;
      section: string;
    }) => {
      posthog?.capture('error_occurred', {
        error_type: data.error_type,
        error_message: data.error_message,
        section: data.section,
      });
    },

    // ==========================================
    // UI INTERACTION EVENTS
    // ==========================================

    trackButtonClicked: (buttonName: string) => {
      posthog?.capture('button_clicked', {
        button_name: buttonName,
      });
    },

    trackModalOpened: (modalName: string) => {
      posthog?.capture('modal_opened', {
        modal_name: modalName,
      });
    },

    trackFormSubmitted: (formName: string) => {
      posthog?.capture('form_submitted', {
        form_name: formName,
      });
    },

    // ==========================================
    // CUSTOM EVENT (for anything else)
    // ==========================================

    trackCustomEvent: (eventName: string, properties: Record<string, any>) => {
      posthog?.capture(eventName, properties);
    },
  };
}

// Usage example:
// const analytics = useAnalytics();
// analytics.trackAnnouncementCreated({
//   scope: 'department',
//   type: 'academic',
//   priority: 'urgent'
// });