import type { Metadata } from 'next';
import { LegalDocument, type LegalSection } from '@/components/legal/legal-document';

export const metadata: Metadata = {
  title: 'Terms of Service | Campus&Me',
  description: 'Terms governing your use of Campus&Me student services and marketplaces.',
};

const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement and operator',
    paragraphs: [
      'These Terms of Service govern your access to and use of the Campus&Me website and installable web application (the Platform). By creating an account or using the Platform, you agree to these Terms and our Privacy Policy. If you do not agree, do not use the Platform.',
      'Campus&Me is intended for university communities in Nigeria. The legal name and registered address of the entity operating the Platform must be confirmed and published by Campus&Me before these Terms are treated as final.',
    ],
  },
  {
    id: 'eligibility',
    title: 'Eligibility and accounts',
    paragraphs: [
      'You must be at least 18 years old to use the Platform. You must provide accurate account information, keep it current, protect your sign-in credentials, and promptly report suspected unauthorised access. One person may maintain one account; you may not create accounts to evade restrictions or misrepresent your identity or status.',
      'You are responsible for activity carried out through your account, except where applicable law provides otherwise.',
    ],
  },
  {
    id: 'services',
    title: 'Campus&Me services',
    paragraphs: ['The Platform currently includes services such as:'],
    bullets: [
      'Accommodation discovery, submissions, verification, and viewing coordination.',
      'A campus marketplace for student and vendor listings, saved items, reports, and paid listing boosts.',
      'Vendor discovery, vendor subscriptions, and business listing tools.',
      'Academic materials, material submissions and downloads, CGPA tools, announcements, and notifications.',
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation and viewings',
    paragraphs: [
      'Accommodation verification reflects checks made at a particular time. It is not a guarantee of a property’s present or future condition, ownership, landlord conduct, price, facilities, or availability. Inspect a property yourself before committing or paying anyone.',
      'Viewing requests are requests, not confirmed appointments. Campus&Me may coordinate with the property owner or caretaker, but cannot guarantee a viewing or a tenancy. If a unit is marked unavailable or rented, active pending or scheduled requests are cancelled and students are notified. Verification expiry may also temporarily remove a listing from search while it awaits re-verification.',
      'Campus&Me facilitates introductions and records accommodation transactions but does not currently collect rent or act as an escrow service. Rental agreements and payments are between you and the property owner or representative.',
    ],
  },
  {
    id: 'submissions',
    title: 'Accommodation submissions and rewards',
    paragraphs: [
      'Submit only information you genuinely know and have a lawful basis to share. A submission is an internal lead and is not automatically published. Submitting a lead does not guarantee verification, publication, a rental, or a referral reward.',
      'A referral may become eligible only after the submission is approved and linked to a verified listing and a completed transaction. Where multiple submissions concern the same property, Campus&Me reviews their timing, quality, and completeness to determine attribution. Eligibility, reward amount, and payment processing remain subject to review and any requirements shown in the Platform.',
    ],
  },
  {
    id: 'marketplace',
    title: 'Marketplace and vendor listings',
    paragraphs: [
      'You may list only products or services you are authorised to offer and that comply with applicable law. Describe listings accurately, use representative images, state prices and condition honestly, and promptly update or remove unavailable or sold listings. Campus&Me may remove listings that violate these Terms or applicable policies.',
      'Vendors must provide accurate business information and complete any verification required by Campus&Me. Subscription features, listing limits, billing periods, and prices are presented at purchase and may vary by plan. You are responsible for fulfilling orders and providing customer service for your own goods and services.',
    ],
  },
  {
    id: 'payments',
    title: 'Fees and payments',
    paragraphs: [
      'Some features, including subscriptions and marketplace boosts, may require payment. Current pricing and applicable terms are shown during checkout. Payments are initiated and verified through Paystack; Campus&Me records payment references and statuses needed to administer the service. Payment credentials are handled by the payment provider.',
      'Unless required by law or stated otherwise at checkout, fees for a service that has already started are not refundable. Campus&Me does not hold funds for transactions between students, sellers, vendors, landlords, or other users.',
    ],
  },
  {
    id: 'content',
    title: 'Your content and materials',
    paragraphs: [
      'You retain rights to content you submit. You grant Campus&Me a non-exclusive, worldwide, royalty-free licence to host, process, display, and distribute that content as reasonably needed to operate, secure, and improve the Platform and the services you request. You confirm that you have the rights and permissions needed to submit it.',
      'Do not upload content that infringes another person’s rights, is unlawful, misleading, abusive, or malicious. Materials and other user submissions may be reviewed, limited, or removed when necessary to operate the Platform or enforce these Terms.',
    ],
  },
  {
    id: 'conduct',
    title: 'Acceptable use',
    paragraphs: ['You must not:'],
    bullets: [
      'Submit fake accommodation leads, listings, reviews, reports, or account details.',
      'Use the Platform to harass, threaten, defraud, impersonate, or unlawfully contact another person.',
      'List illegal, stolen, counterfeit, or otherwise prohibited goods or services.',
      'Attempt to bypass access controls, interfere with the Platform, scrape it without permission, or introduce malware.',
      'Misuse referral, subscription, payment, analytics, or notification features.',
    ],
  },
  {
    id: 'safety',
    title: 'User transactions and safety',
    paragraphs: [
      'Campus&Me is a platform and coordination service, not a party to agreements between users. You are responsible for verifying goods, properties, identities, and payment arrangements. When meeting another user, use reasonable safety precautions and do not pay solely because a listing appears on Campus&Me.',
    ],
  },
  {
    id: 'suspension',
    title: 'Suspension and termination',
    paragraphs: [
      'You may stop using the Platform at any time. Campus&Me may restrict, suspend, or terminate access where reasonably necessary to protect users or the Platform, investigate suspected fraud or abuse, enforce these Terms, or comply with law. Where appropriate, we will provide notice and an opportunity to resolve the issue.',
    ],
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    paragraphs: [
      'The Platform is provided on an “as available” basis. To the extent permitted by law, Campus&Me does not guarantee uninterrupted or error-free operation, the accuracy of user-provided information, the continued availability of a listing, or the conduct of another user. Nothing in these Terms excludes a consumer right or other liability that applicable law does not allow us to exclude.',
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    paragraphs: [
      'To the extent permitted by applicable law, Campus&Me is not liable for indirect or consequential loss arising from your use of the Platform or a transaction between users. Our liability for a claim will be limited to the amount you paid to Campus&Me for the relevant service in the three months before the event, or ₦10,000, whichever is greater. This limit does not apply where prohibited by law, including liability that cannot lawfully be limited.',
    ],
  },
  {
    id: 'indemnity',
    title: 'Your responsibility for claims',
    paragraphs: [
      'To the extent permitted by law, you are responsible for claims and reasonable costs arising from your unlawful use of the Platform, your content, or your material breach of these Terms. This does not require you to indemnify Campus&Me for its own unlawful conduct or negligence.',
    ],
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    paragraphs: [
      'These Terms are governed by the laws of the Federal Republic of Nigeria, subject to mandatory consumer protections. Please contact us first so we can try to resolve a concern informally. Any court proceedings will be brought before a court with competent jurisdiction in Nigeria.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to these Terms',
    paragraphs: [
      'We may update these Terms as the Platform changes or to reflect legal requirements. We will update the date on this page and provide additional notice for material changes where appropriate. Continued use after updated Terms take effect means you accept them, unless applicable law requires another form of consent.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact and operator details',
    paragraphs: [
      'For questions about these Terms, contact support@campusandme.ng. The legal entity name, registered address, and telephone details supplied in the source draft were placeholders and must be completed by the operator before publication.',
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      summary="The terms for using Campus&Me’s student services, accommodation tools, and campus marketplaces. Please read them before using the Platform."
      updatedAt="October 1, 2026"
      sections={sections}
    />
  );
}