import type { Step } from 'react-joyride';

export type TourKind = 'student' | 'vendor';
export type TourStep = Step & { route: string };

export function isDesktopView(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
}

/**
 * The dashboard layout renders page content twice (a desktop wrapper and a
 * mobile wrapper, toggled by `hidden md:block` / `md:hidden`). On mobile the
 * desktop copy is `display: none`, so a plain querySelector returns a hidden
 * element and the tour reports the target as not visible. Return the first
 * visible instance instead.
 */
function visibleQuery(selector: string): HTMLElement | null {
  if (typeof window === 'undefined') return null;
  const nodes = document.querySelectorAll<HTMLElement>(selector);
  for (const node of nodes) {
    if (node.offsetParent !== null) return node;
  }
  return nodes[0] ?? null;
}

function pageTarget(selector: string): () => HTMLElement | null {
  return () => {
    const wrapper = visibleQuery(selector);
    if (!wrapper) return null;
    if (isDesktopView()) return wrapper;
    const compact =
      wrapper.querySelector<HTMLElement>('h1, h2, h3, h4') ||
      wrapper.querySelector<HTMLElement>('[data-slot="card"]') ||
      wrapper.querySelector<HTMLElement>('a, button, [role="button"]');
    return compact ?? wrapper;
  };
}

/**
 * Returns the first visible instance of a duplicated element (the dashboard
 * layout renders content twice; the hidden copy must never be targeted).
 */
function visibleTarget(selector: string): () => HTMLElement | null {
  return () => visibleQuery(selector);
}

/**
 * Mobile steps target elements inside the content's own scroll container
 * (overflow-y-auto), where Joyride's default absolute tooltip strategy
 * misplaces the floater. Force fixed positioning so the tooltip is
 * viewport-anchored like the spotlight.
 */
function mobileStep(step: TourStep): TourStep {
  return {
    ...step,
    floatingOptions: { ...step.floatingOptions, strategy: 'fixed' },
  };
}

export function navTarget(): HTMLElement | null {
  if (typeof window === 'undefined') return null;
  const isDesktop = window.matchMedia('(min-width: 768px)').matches;
  if (isDesktop) {
    // Prefer the vendor sidebar when we can detect the vendor dashboard.
    // Vendor sidebar includes a header/footer text like "Vendor Dashboard" or
    // "Vendor Account"; detect those markers first and return the sidebar
    // element when present.
    let sidebar = document.querySelector('[data-slot="sidebar"]');
    if (sidebar) {
      try {
        const headerText = (sidebar.querySelector('h1, p, a') as HTMLElement | null)
          ?.textContent?.trim() ?? '';
        const footerText = (sidebar.querySelector('footer, .sidebar-footer, p') as HTMLElement | null)
          ?.textContent?.trim() ?? '';

        const isVendorSidebar = /Vendor Dashboard|Vendor Account/i.test(headerText + ' ' + footerText);
        if (isVendorSidebar){ 
          sidebar = document.querySelector('[data-tour="vendor-sidebar"]');
          return sidebar as HTMLElement;

        }
      } catch {
        // ignore and fall back to default
      }
    }

    return sidebar as HTMLElement | null;
  }
  const nodes = document.querySelectorAll<HTMLElement>('[data-tour="mobile-nav"]');
  for (const node of nodes) {
    if (node.offsetParent !== null) return node;
  }
  return nodes[0] ?? null;
}

export const studentTourSteps: TourStep[] = [
  {
    target: '[data-tour="student-welcome"]',
    content: 'This quick tour will show you around your dashboard. Click Next to begin.',
    title: 'Welcome to UniHub',
    route: '/dashboard',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="student-stats"]'),
    content: 'Track your CGPA, browse study materials, and explore verified student vendors — all in one place.',
    title: 'Your academic snapshot',
    route: '/dashboard',
    placement: 'top',
  },
  {
    target: '[data-tour="student-actions"]',
    content: 'Jump straight to the materials library, add a semester, find vendors, or read the latest announcements.',
    title: 'Quick Actions',
    route: '/dashboard',
    placement: 'top',
  },
  {
    target: navTarget,
    content: 'Use the menu to navigate every section. On mobile, use the bottom bar.',
    title: 'Navigate anywhere',
    route: '/dashboard',
    placement: 'auto',
  },
  {
    target: pageTarget('[data-tour="page-materials"]'),
    content: 'Access lecture notes, past questions, and study materials uploaded by verified students.',
    title: 'Materials Library',
    route: '/dashboard/materials',
    placement: 'top',
  },
  {
    target: pageTarget('[data-tour="page-cgpa"]'),
    content: 'Add your semester results and instantly calculate your cumulative GPA.',
    title: 'CGPA Calculator',
    route: '/dashboard/cgpa',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-profile"]'),
    content: 'Update your personal details, manage your matric number, and view your subscription status.',
    title: 'Your Profile',
    route: '/dashboard/profile',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-vendors"]'),
    content: 'Connect with verified service providers on campus — from food to fashion.',
    title: 'Vendors Marketplace',
    route: '/dashboard/vendors',
    placement:'top',
  },
  {
    target: pageTarget('[data-tour="page-announcements"]'),
    content: 'Stay updated with department and university announcements.',
    title: 'Announcements',
    route: '/dashboard/announcements',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-settings"]'),
    content: 'Customize your appearance, notifications, and privacy preferences.',
    title: 'Settings',
    route: '/dashboard/settings',
    placement: 'bottom',
  },
];

export function vendorTourSteps(includeToggle: boolean): TourStep[] {
  const steps: TourStep[] = [
    {
      target: '[data-tour="vendor-welcome"]',
      content: 'Your vendor dashboard at a glance. Manage your business and track how it\'s performing.',
      title: 'Welcome to your Vendor Dashboard',
      route: '/dashboard',
      placement: 'bottom',
    },
    {
      target: pageTarget('[data-tour="vendor-stats"]'),
      content: 'See how many people viewed your listing, reached out, and rated your service.',
      title: 'Your performance',
      route: '/dashboard',
      placement: 'top',
    },
  ];

  if (includeToggle) {
    steps.push({
      target: '[data-tour="dashboard-toggle"]',
      content: 'Switch between your Student and Vendor dashboards anytime using this toggle.',
      title: 'Student ↔ Vendor',
      route: '/dashboard',
      placement: 'bottom',
    });
  }

  steps.push(
    {
      target: navTarget,
      content: 'Use the menu to access analytics, subscription, notifications, and settings. On mobile, use the bottom bar.',
      title: 'Vendor navigation',
      route: '/dashboard',
      placement: 'auto',
    },
    {
      target: pageTarget('[data-tour="page-analytics"]'),
      content: 'Dive into views, contacts, ratings, and conversion data over time.',
      title: 'Analytics',
      route: '/dashboard/vendors/analytics',
      placement: 'left',
    },
    {
      target: pageTarget('[data-tour="page-subscription"]'),
      content: 'Manage your subscription plan, view billing history, and upgrade or cancel.',
      title: 'Subscription',
      route: '/dashboard/subscription',
      placement: 'bottom',
    },
    {
      target: pageTarget('[data-tour="page-notifications"]'),
      content: 'Get alerts for inquiries and activity related to your business.',
      title: 'Notifications',
      route: '/dashboard/notifications',
      placement: 'bottom',
    },
    {
      target: pageTarget('[data-tour="page-settings"]'),
      content: 'Customize your appearance and manage your account.',
      title: 'Settings',
      route: '/dashboard/settings',
      placement: 'bottom',
    },
  );

  return steps;
}

/**
 * Short mobile tour (5 steps max). The bottom bar replaces the sidebar, so the
 * navigation step targets the fixed bottom nav instead. Page steps stay compact
 * and keep the tooltip below the highlight so it stays inside the viewport.
 */
export const studentMobileTourSteps: TourStep[] = [
  mobileStep({
    target: visibleTarget('[data-tour="student-welcome"]'),
    content: 'This quick tour will show you around your dashboard. Tap Next to begin.',
    title: 'Welcome to UniHub',
    route: '/dashboard',
    placement: 'bottom',
  }),
  mobileStep({
    target: navTarget,
    content: 'Use this bar to jump between your Dashboard, Materials, CGPA, Vendors, and Announcements.',
    title: 'Navigate anywhere',
    route: '/dashboard',
    placement: 'top',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-materials"]'),
    content: 'Access lecture notes, past questions, and study materials uploaded by verified students.',
    title: 'Materials Library',
    route: '/dashboard/materials',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-cgpa"]'),
    content: 'Add your semester results and instantly calculate your cumulative GPA.',
    title: 'CGPA Calculator',
    route: '/dashboard/cgpa',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-announcements"]'),
    content: 'Stay updated with the latest news and announcements from your institution.',
    title: 'Announcements',
    route: '/dashboard/announcements',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-vendors"]'),
    content: 'Connect with verified service providers on campus — from food to fashion.',
    title: 'Vendors Marketplace',
    route: '/dashboard/vendors',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-profile"]'),
    content: 'Update your personal details, manage your matric number, and view your subscription status.',
    title: 'Your Profile',
    route: '/dashboard/profile',
    placement: 'bottom',
  })
];

export function vendorMobileTourSteps(): TourStep[] {
  return [
    mobileStep({
      target: visibleTarget('[data-tour="vendor-welcome"]'),
      content: "Your vendor dashboard at a glance. Manage your business and track how it's performing.",
      title: 'Welcome to your Vendor Dashboard',
      route: '/dashboard',
      placement: 'bottom',
    }),
    mobileStep({
      target: navTarget,
      content: 'Use this bar to access analytics, subscription, notifications, and settings.',
      title: 'Vendor navigation',
      route: '/dashboard',
      placement: 'top',
    }),
    mobileStep({
      target: pageTarget('[data-tour="page-analytics"]'),
      content: 'Dive into views, contacts, ratings, and conversion data over time.',
      title: 'Analytics',
      route: '/dashboard/vendors/analytics',
      placement: 'bottom',
    }),
    mobileStep({
      target: pageTarget('[data-tour="page-notifications"]'),
      content: 'Get alerts for inquiries and activity related to your business.',
      title: 'Notifications',
      route: '/dashboard/notifications',
      placement: 'bottom',
    }),
    mobileStep({
      target: pageTarget('[data-tour="page-settings"]'),
      content: 'Customize your appearance and manage your account.',
      title: 'Settings',
      route: '/dashboard/settings',
      placement: 'bottom',
    }),
  ];
}
