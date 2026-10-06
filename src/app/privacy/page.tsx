import type { Metadata } from 'next';
import { LegalDocument, type LegalSection } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Privacy Policy | Campus&Me',
  description: 'How Campus&Me collects, uses, shares, and protects personal information.',
};

const sections: LegalSection[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    paragraphs: [
      'This Privacy Policy explains how Campus&Me collects, uses, stores, and shares information when you use our website and installable web application. It applies to the Platform’s accommodation, marketplace, vendor, academic, account, and notification features.',
      'Campus&Me is intended for university communities in Nigeria. The legal operator and registered address were not provided in the source draft and must be confirmed before publication.',
    ],
  },
  {
    id: 'information',
    title: 'Information we collect',
    paragraphs: ['Depending on the features you use, information may include:'],
    bullets: [
      'Account and profile data such as your name, email address, phone number, account type, faculty, department, level, and other details you submit. Authentication is provided through Supabase; Campus&Me does not receive your plaintext password.',
      'Student identifiers such as a matriculation number where you provide one, and academic details you enter into CGPA tools.',
      'Academic information you enter for CGPA tools, and materials or files you upload, view, or download.',
      'Accommodation submissions, property and caretaker details, verification records, viewing requests, preferred viewing times, contact details, messages, and transaction records.',
      'Marketplace and vendor information, including listings, descriptions, images, prices, saved items, reports, business details, and service interactions.',
      'Payment references, amounts, plan or boost details, and payment status. Paystack processes the payment checkout.',
      'Bank name, account name, and account number if you provide payout details for a referral reward.',
      'Notification device tokens, notification preferences, and notification delivery/read records.',
      'Technical and usage information such as device/browser details, pages visited, feature interactions, timestamps, diagnostics, and analytics events.',
    ],
  },
  {
    id: 'use',
    title: 'How we use information',
    paragraphs: ['We use information to:'],
    bullets: [
      'Create and secure accounts, provide requested features, and personalise relevant parts of the service.',
      'Review accommodation submissions, verify listings, coordinate viewings, manage cancellations when a unit becomes unavailable, and administer referral rewards.',
      'Publish and moderate marketplace/vendor listings, process reports, and support transactions and subscriptions.',
      'Deliver notifications, maintain user preferences, respond to support requests, and communicate service changes.',
      'Measure usage, understand reliability and performance, detect abuse, and improve the Platform.',
      'Meet legal obligations and protect users, the Platform, and our rights.',
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation and marketplace visibility',
    paragraphs: [
      'Accommodation leads are stored as internal submissions and are not automatically published. Authorised staff may use the information to contact property owners, verify a unit, coordinate a viewing, and process a reported or completed transaction. When needed to arrange a requested viewing, relevant student contact details may be shared with the owner, landlord, caretaker, or their representative.',
      'Marketplace listings and vendor information are shown to other Platform users as needed to operate discovery and contact features. Do not include sensitive personal information in public listing text or images. We do not sell personal information.',
    ],
  },
  {
    id: 'analytics',
    title: 'Analytics and diagnostics',
    paragraphs: [
      'The current app uses PostHog for manually captured page views and page-leave events, product events, and user identification. For signed-in users, identification can include account ID, email, name, account type, role, faculty, department, level, and account creation date. The current PostHog configuration samples approximately 10% of sessions for session replay. Vercel Analytics and Speed Insights are also included, and Sentry is used for error diagnostics.',
      'PostHog is configured to persist analytics data in browser local storage and a cookie. The Platform and its service providers may also use browser storage or cookies to support authentication and essential operation.',
      'The privacy-settings screen currently displays profile visibility, email/phone display, activity tracking, and analytics switches, but these controls only change local screen state and are not connected to persistent account preferences or the corresponding processing. The account deletion button is also not connected to a deletion workflow. Do not rely on these controls to change data handling; contact us to make a privacy request.',
    ],
  },
  {
    id: 'sharing',
    title: 'How information is shared',
    paragraphs: ['We share information only as needed for the purposes described in this Policy, including with:'],
    bullets: [
      'Authorised Campus&Me administrators and staff who operate accommodation, marketplace, vendor, support, and safety workflows.',
      'Property owners or caretakers when necessary to coordinate a viewing or accommodation transaction.',
      'Service providers that support the Platform, including Supabase (database, authentication, and storage), Firebase Cloud Messaging (push delivery), PostHog (product analytics), Vercel (hosting analytics and performance), Sentry (error diagnostics), and Paystack (payments).',
      'Authorities or other parties where required by law, or where disclosure is reasonably necessary to protect people, investigate abuse, or enforce our terms.',
      'A successor organisation if the Platform is involved in a merger, restructuring, or transfer of assets, subject to appropriate safeguards and notice where required.',
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    paragraphs: [
      'Paid subscriptions and boosts are initiated and verified through Paystack. We receive and retain the transaction details needed to reconcile payment and provide the purchased feature, such as a payment reference, amount, user or plan association, and status. Paystack handles payment credentials under its own terms and privacy policy. Campus&Me does not act as escrow for payments between users.',
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    paragraphs: [
      'If you register a device for push notifications, we store its device token and use Firebase Cloud Messaging to deliver relevant notifications. The app stores notification preferences by category; users without a saved preference record are currently treated as opted in by the notification service. You can update supported category preferences in notification settings and remove a device token by signing out or unregistering that device.',
    ],
  },
  {
    id: 'storage',
    title: 'Storage, security, and international processing',
    paragraphs: [
      'Account, listing, accommodation, and transaction data is stored in Supabase services; uploaded media may be stored in Supabase Storage. Our providers may process information in the regions where their services are configured, which may be outside Nigeria. Provider-specific safeguards and terms may apply.',
      'We use access controls and encrypted connections where supported, and limit access to authorised roles. No internet service can guarantee absolute security. Please protect your account credentials and contact us promptly if you suspect unauthorised access.',
    ],
  },
  {
    id: 'retention',
    title: 'Retention',
    paragraphs: [
      'We retain personal information while it is needed to provide the Platform, maintain account and transaction records, resolve disputes, protect against abuse, and meet legal or operational obligations. Different records may be kept for different periods. We do not currently publish a fixed deletion schedule for each category.',
    ],
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    paragraphs: [
      'Depending on applicable law, you may request access to or correction or deletion of your personal information, object to or restrict certain processing, withdraw consent where processing relies on consent, or request a portable copy. Some records may need to be retained for legal, security, or transaction reasons.',
      'The visibility, activity, and analytics controls and account deletion button shown in the current Privacy & Security screen are not connected to backend workflows. To make a privacy request, contact privacy@campusandme.ng. Notification category preferences are supported separately in notification settings.',
    ],
  },
  {
    id: 'children',
    title: 'Children',
    paragraphs: [
      'Campus&Me is intended for adults and university communities. You must be at least 18 years old to use the Platform. We do not knowingly collect personal information from children under 18; contact us if you believe a child has provided information so we can review it.',
    ],
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    paragraphs: [
      'The Platform may link to third-party websites or services. Their privacy practices are governed by their own policies, not this one. Review those policies before submitting information to them.',
    ],
  },
  {
    id: 'updates',
    title: 'Changes to this Policy',
    paragraphs: [
      'We may update this Policy as the Platform or applicable requirements change. We will revise the date on this page and provide additional notice for material changes where appropriate. Your continued use after an update takes effect is subject to the revised Policy, except where applicable law requires another form of consent.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact us',
    paragraphs: [
      'For privacy questions or requests, contact privacy@campusandme.ng. For general support, contact support@campusandme.ng. The registered operator name and address must be added by Campus&Me before publication.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary="A clear account of the information Campus&Me uses to provide accommodation, marketplace, academic, vendor, and notification services."
      updatedAt="October 1, 2026"
      sections={sections}
    />
  );
}