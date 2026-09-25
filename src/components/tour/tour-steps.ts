import type { Step } from 'react-joyride';

export type TourKind = 'student' | 'vendor';
type FloatingOptions = { strategy:string; [key: string]: any };
export type TourStep = Omit<Step, 'floatingOptions'> & {
  route: string;
  floatingOptions?: FloatingOptions;
  menuOpener?: boolean;
  menuItemRoute?: string;
};

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

const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/materials': 'Materials',
  '/dashboard/cgpa': 'CGPA',
  '/dashboard/profile': 'Profile',
  '/dashboard/vendors': 'Vendors',
  '/dashboard/accommodation': 'Accommodation',
  '/dashboard/accommodation/my-submissions': 'My Submissions',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/settings': 'Settings',
  '/dashboard/vendors/analytics': 'Analytics',
  '/dashboard/subscription': 'Subscription',
  '/dashboard/notifications': 'Notifications',
};

function routeLabel(route: string): string {
  return ROUTE_LABELS[route] ?? route.split('/').filter(Boolean).pop() ?? 'the next section';
}

/**
 * Routes whose only mobile navigation link lives in the header dropdown menu
 * (mobile-header-menu) rather than the bottom bar. They need a two-stage
 * prompt: open the header menu first, then tap the item.
 */
const HEADER_MENU_ROUTES = new Set(['/dashboard/profile', '/dashboard/settings']);

/**
 * Alerts left the mobile bottom bar and now live in the header bell, so on
 * mobile the notifications route is reached by tapping the bell rather than a
 * bar item.
 */
const BELL_ROUTE = '/dashboard/notifications';

function bellTarget(): () => HTMLElement | null {
  return () => {
    if (typeof window === 'undefined') return null;
    return document.querySelector<HTMLElement>('[data-tour="notification-bell"]');
  };
}

function isBellRoute(route: string): boolean {
  return route === BELL_ROUTE;
}

function isHeaderMenuRoute(route: string): boolean {
  return HEADER_MENU_ROUTES.has(route);
}

function menuTriggerTarget(): () => HTMLElement | null {
  return () => {
    if (typeof window === 'undefined') return null;
    return document.querySelector<HTMLElement>('[data-tour="mobile-header-menu"]');
  };
}

/**
 * Resolves the dropdown item linking to `route` inside the header menu. The
 * item only exists in the DOM while the dropdown is open.
 */
function menuItemTarget(route: string): () => HTMLElement | null {
  return () => {
    if (typeof window === 'undefined') return null;
    const nodes = document.querySelectorAll<HTMLElement>(`[href="${route}"]`);
    for (const node of nodes) {
      if (node.closest('[data-slot="dropdown-menu-content"]')) return node;
    }
    return null;
  };
}

/**
 * Resolves the menu item that links to `route` — the sidebar link on desktop
 * (falling back to any visible link) and the bottom-bar link on mobile. This is
 * the element the user must click to reach the next tour page.
 */
function navLinkTarget(route: string): () => HTMLElement | null {
  return () => {
    if (typeof window === 'undefined') return null;
    const nodes = document.querySelectorAll<HTMLElement>(`[href="${route}"]`);
    if (isDesktopView()) {
      for (const node of nodes) {
        if (node.closest('[data-slot="sidebar"], [data-tour="vendor-sidebar"]')) return node;
      }
    } else {
      for (const node of nodes) {
        if (node.closest('[data-tour="mobile-nav"]')) return node;
      }
      for (const node of nodes) {
        if (node.offsetParent !== null) return node;
      }
    }
    return nodes[0] ?? null;
  };
}

/**
 * A step that asks the user to click the menu item leading to `next`'s page.
 * It lives on `sourceRoute` (the page the user is currently on) and only offers
 * Skip — the tour only advances once the user actually clicks the highlighted
 * menu item (manual navigation is picked up by OnboardingTour).
 */
function buildNavPromptStep(
  sourceRoute: string,
  next: TourStep,
  isMobile: boolean,
  target?: () => HTMLElement | null,
): TourStep {
  const label = routeLabel(next.route);
  const viaBell = isMobile && isBellRoute(next.route);
  return {
    target: target ?? navLinkTarget(next.route),
    title: viaBell ? 'Your alerts live in the bell' : `Open ${label}`,
    content: viaBell
      ? 'Tap the bell in the header to continue. A dot on it means you have unread notifications.'
      : isMobile
        ? `Tap "${label}" in the bar below to continue.`
        : `Click "${label}" in the sidebar to continue.`,
    route: sourceRoute,
    placement: viaBell ? 'bottom' : isMobile ? 'top' : 'right',
    floatingOptions: isMobile ? { strategy: 'fixed' } : undefined,
    buttons: ['skip'],
  };
}

/**
 * Two-stage prompt for routes that only exist inside the mobile header
 * dropdown: first ask the user to open the header menu, then to tap the item.
 * The tour advances from the first to the second step once the dropdown opens
 * (see OnboardingTour), and from the second step when the user taps the item
 * (manual navigation is picked up by OnboardingTour).
 */
function buildMenuPromptSteps(sourceRoute: string, next: TourStep, isMobile: boolean): TourStep[] {
  const label = routeLabel(next.route);
  const floatingOptions = isMobile ? { strategy: 'fixed' } : undefined;
  return [
    {
      target: menuTriggerTarget(),
      title: 'Open the menu',
      content: isMobile
        ? 'Tap the menu button in the header to continue.'
        : 'Click the menu button in the header to continue.',
      route: sourceRoute,
      placement: 'bottom',
      floatingOptions,
      buttons: ['skip'],
      menuOpener: true,
    },
    {
      target: menuItemTarget(next.route),
      title: `Open ${label}`,
      content: isMobile ? `Tap "${label}" in the menu to continue.` : `Click "${label}" in the menu to continue.`,
      route: sourceRoute,
      placement: 'bottom',
      floatingOptions,
      buttons: ['skip'],
      menuItemRoute: next.route,
    },
  ];
}

/**
 * Inserts a navigation-prompt step before every step that lives on a different
 * page, so the user is guided to click the actual menu item instead of being
 * auto-navigated. Routes that live in the mobile header dropdown get a
 * two-stage prompt (open the menu, then tap the item).
 */
export function insertNavPromptSteps(steps: TourStep[], isMobile: boolean): TourStep[] {
  const result: TourStep[] = [];
  let sourceRoute = steps[0]?.route ?? null;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (i > 0 && sourceRoute && step.route && step.route !== sourceRoute) {
      if (isMobile && isHeaderMenuRoute(step.route)) {
        result.push(...buildMenuPromptSteps(sourceRoute, step, isMobile));
      } else if (isMobile && isBellRoute(step.route)) {
        result.push(buildNavPromptStep(sourceRoute, step, isMobile, bellTarget()));
      } else {
        result.push(buildNavPromptStep(sourceRoute, step, isMobile));
      }
    }
    result.push(step);
    if (step.route) sourceRoute = step.route;
  }
  return result;
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
    title: 'Welcome to CampusHub',
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
    target: pageTarget('[data-tour="page-accommodation"]'),
    content: 'Browse verified student housing near campus. Spotted a vacancy? Submit it and follow its verification under My Submissions.',
    title: 'Accommodation',
    route: '/dashboard/accommodation',
    placement: 'top',
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
    content: 'Get alerts for inquiries and activity related to your business. A dot on the header bell flags anything unread.',
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
 * Mobile tour. The bottom bar replaces the sidebar, so the navigation step
 * targets the fixed bottom nav, and the header bell (which replaced the bar's
 * Alerts tab) gets its own step. Page steps stay compact and keep the tooltip
 * below the highlight so it stays inside the viewport.
 */
export const studentMobileTourSteps: TourStep[] = [
  mobileStep({
    target: visibleTarget('[data-tour="student-welcome"]'),
    content: 'This quick tour will show you around your dashboard. Tap Next to begin.',
    title: 'Welcome to CampusHub',
    route: '/dashboard',
    placement: 'bottom',
  }),
  mobileStep({
    target: navTarget,
    content: 'Use this bar to jump between your Dashboard, Materials, CGPA, Accommodation, Vendors, and Announcements.',
    title: 'Navigate anywhere',
    route: '/dashboard',
    placement: 'top',
  }),
  mobileStep({
    target: bellTarget(),
    content: 'Alerts now live in this bell, next to the menu. A dot on it means you have unread notifications.',
    title: 'Your alert bell',
    route: '/dashboard',
    placement: 'bottom',
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
    target: pageTarget('[data-tour="page-accommodation"]'),
    content: 'Browse verified student housing near campus. Spotted a vacancy? Submit it and follow its verification under My Submissions.',
    title: 'Accommodation',
    route: '/dashboard/accommodation',
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
    target: pageTarget('[data-tour="page-announcements"]'),
    content: 'Stay updated with the latest news and announcements from your institution.',
    title: 'Announcements',
    route: '/dashboard/announcements',
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
      content: 'Use this bar to access analytics, subscription, and settings. Your alerts live in the bell in the header.',
      title: 'Vendor navigation',
      route: '/dashboard',
      placement: 'top',
    }),
    mobileStep({
      target: bellTarget(),
      content: 'Tap the bell to see inquiries and activity alerts. A dot on it means something is unread.',
      title: 'Your alert bell',
      route: '/dashboard',
      placement: 'bottom',
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
