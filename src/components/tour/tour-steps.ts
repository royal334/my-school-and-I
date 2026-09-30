import type { Step } from 'react-joyride';

export type TourKind = 'student' | 'vendor';
type FloatingOptions = { strategy: string; [key: string]: any };
type StepTarget = Step['target'];

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

/**
 * Resolves a step target that may be a CSS selector or a resolver function.
 * Shared by the step factories and the OnboardingTour engine so both agree on
 * what a step actually points at.
 */
export function resolveStepTarget(target?: StepTarget): HTMLElement | null {
  if (typeof window === 'undefined' || !target) return null;
  try {
    if (typeof target === 'function') return (target as () => HTMLElement | null)();
    if (typeof target === 'string') return document.querySelector<HTMLElement>(target);
    if (target instanceof HTMLElement) return target;
  } catch {
    return null;
  }
  return null;
}

function narrowOnMobile(wrapper: HTMLElement): HTMLElement {
  if (isDesktopView()) return wrapper;
  return (
    wrapper.querySelector<HTMLElement>('h1, h2, h3, h4') ||
    wrapper.querySelector<HTMLElement>('[data-slot="card"]') ||
    wrapper.querySelector<HTMLElement>('a, button, [role="button"]') ||
    wrapper
  );
}

/**
 * A page-level anchor. `alt` is a second anchor used when the primary one is
 * missing — several sections render conditionally (an empty vendors list, a
 * dashboard without announcements) and the step must still resolve.
 */
function pageTarget(selector: string, alt?: StepTarget): () => HTMLElement | null {
  return () => {
    const wrapper = visibleQuery(selector);
    if (wrapper) return narrowOnMobile(wrapper);
    return resolveStepTarget(alt);
  };
}

/**
 * Returns the first visible instance of a duplicated element (the dashboard
 * layout renders content twice; the hidden copy must never be targeted).
 */
function visibleTarget(selector: string, alt?: StepTarget): () => HTMLElement | null {
  return () => visibleQuery(selector) ?? resolveStepTarget(alt);
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
  '/dashboard/materials/upload': 'Upload material',
  '/dashboard/profile': 'Profile',
  '/dashboard/market': 'Market',
  '/dashboard/vendors': 'Vendors',
  '/dashboard/marketplace': 'Marketplace',
  '/dashboard/marketplace/sell': 'Sell',
  '/dashboard/marketplace/saved': 'Saved listings',
  '/dashboard/marketplace/my-listings': 'My listings',
  '/dashboard/accommodation': 'Accommodation',
  '/dashboard/accommodation/submit': 'Submit a vacancy',
  '/dashboard/accommodation/my-submissions': 'My Submissions',
  '/dashboard/announcements': 'Announcements',
  '/dashboard/settings': 'Settings',
  '/dashboard/vendors/analytics': 'Analytics',
  '/dashboard/vendors/my-listings': 'Manage listing',
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
      content: isMobile
        ? `Tap "${label}" in the menu to continue.`
        : `Click "${label}" in the menu to continue.`,
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
        if (isVendorSidebar) {
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

/** The header button that replays the tour. It lives in the desktop top bar. */
function tourHelpTarget(): () => HTMLElement | null {
  return () => visibleQuery('[data-tour="tour-help"]');
}

const CLOSING_STEP: TourStep = {
  target: tourHelpTarget(),
  content: 'Finished — but you can replay this tour any time with this button in the header.',
  title: 'Take the tour again',
  route: '/dashboard/settings',
  placement: 'bottom',
};

/** On mobile the replay entry lives inside the header dropdown menu. */
function mobileMenuTarget(): () => HTMLElement | null {
  return () => visibleQuery('[data-tour="mobile-header-menu"]');
}

const MOBILE_CLOSING_STEP: TourStep = {
  target: mobileMenuTarget(),
  content: 'Finished — open this menu any time and pick "Replay tour" to go through it again.',
  title: 'Take the tour again',
  route: '/dashboard/settings',
  placement: 'bottom',
  floatingOptions: { strategy: 'fixed' },
};

/**
 * Student tour, desktop. The page order mirrors the sidebar: Dashboard →
 * Materials → Accommodation → Market → Notifications → Announcements →
 * Profile → Settings, so every transition is a real sidebar link the user can
 * click.
 */
export const studentTourSteps: TourStep[] = [
  {
    target: visibleTarget('[data-tour="student-welcome"]'),
    content: 'This quick tour will show you around your dashboard. Click Next to begin.',
    title: 'Welcome to CampusHub',
    route: '/dashboard',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="student-stats"]'),
    content: 'Live snapshot of your CGPA, the materials library, the vendor count, and a shortcut to send us feedback.',
    title: 'Your academic snapshot',
    route: '/dashboard',
    placement: 'top',
  },
  {
    // The card is only rendered when there are published announcements, so fall
    // back to the Announcements link when the feed is empty.
    target: pageTarget(
      '[data-tour="student-recent-announcements"]',
      () => navLinkTarget('/dashboard/announcements')(),
    ),
    content: 'The latest department and university announcements land here. View all jumps to the full feed.',
    title: 'Recent announcements',
    route: '/dashboard',
    placement: 'top',
  },
  {
    target: pageTarget('[data-tour="student-profile-card"]'),
    content: 'Your level, matric number and plan at a glance, plus a checklist of what to finish setting up.',
    title: 'Your profile and getting started',
    route: '/dashboard',
    placement: 'top',
  },
  {
    target: '[data-tour="student-actions"]',
    content: 'Shortcuts to browse materials, add a semester, find vendors, and read announcements.',
    title: 'Quick actions',
    route: '/dashboard',
    placement: 'top',
  },
  {
    target: navTarget,
    content: 'The sidebar is your map: Materials, Accommodation, Market, Notifications, Announcements, Profile and Settings.',
    title: 'Navigate anywhere',
    route: '/dashboard',
    placement: 'auto',
  },
  {
    target: pageTarget('[data-tour="page-materials"]'),
    content: 'Lecture notes, past questions and study materials from verified students. Filter by level, semester or type, and bookmark anything you want to keep.',
    title: 'Materials library',
    route: '/dashboard/materials',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-accommodation"]'),
    content: 'Verified student housing near campus. Spotted a vacancy? Submit it, then track its verification under My Submissions.',
    title: 'Accommodation',
    route: '/dashboard/accommodation',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-market-tabs"]'),
    content: 'Market is now the single home for the campus economy. This tab switches between verified vendors and peer-to-peer listings.',
    title: 'Market: vendors and marketplace',
    route: '/dashboard/market',
    placement: 'bottom',
  },
  {
    // The marketplace header only renders on the Marketplace tab; fall back to
    // the page shell when the Vendors tab is showing.
    target: pageTarget('[data-tour="page-marketplace"]', '[data-tour="page-market"]'),
    content: 'Search and filter listings, tap Sell to run the guided listing wizard, and manage what you have posted under My listings.',
    title: 'Buy and sell on campus',
    route: '/dashboard/market',
    placement: 'bottom',
  },
  {
    target: pageTarget('[data-tour="page-notifications"]'),
    content: 'Announcements, vendor updates and activity alerts are collected here so nothing slips past you.',
    title: 'Notifications',
    route: '/dashboard/notifications',
    placement: 'top',
  },
  {
    target: pageTarget('[data-tour="page-announcements"]'),
    content: 'The full feed of department and university announcements, newest first.',
    title: 'Announcements',
    route: '/dashboard/announcements',
    placement: 'top',
  },
  {
    target: pageTarget('[data-tour="page-profile"]'),
    content: 'Update your personal details and matric number, change your password, and review your subscription status.',
    title: 'Your profile',
    route: '/dashboard/profile',
    placement: 'top',
  },
  {
    target: pageTarget('[data-tour="page-settings"]'),
    content: 'Pick a theme, choose which notifications you get, and set your preferences.',
    title: 'Settings',
    route: '/dashboard/settings',
    placement: 'top',
  },
  CLOSING_STEP,
];

export function vendorTourSteps(includeToggle: boolean): TourStep[] {
  const steps: TourStep[] = [
    {
      target: '[data-tour="vendor-welcome"]',
      content: "Your vendor dashboard at a glance. Manage your business and track how it's performing.",
      title: 'Welcome to your Vendor Dashboard',
      route: '/dashboard',
      placement: 'bottom',
    },
    {
      target: visibleTarget('[data-tour="vendor-stats"]', '[data-tour="vendor-welcome"]'),
      content: 'See how many people viewed your listing, reached out, and rated your service.',
      title: 'Your performance',
      route: '/dashboard',
      placement: 'top',
    },
    {
      target: visibleTarget('[data-tour="vendor-actions"]', '[data-tour="vendor-welcome"]'),
      content: 'Jump to your listing, analytics, notifications and account settings from here.',
      title: 'Quick actions',
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
      content: 'This menu is your business hub: Analytics, Subscription, Notifications and Settings.',
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
    CLOSING_STEP,
  );

  return steps;
}

/**
 * Mobile tour. The bottom bar replaces the sidebar, so the navigation step
 * targets the fixed bottom nav, and the header bell (which replaced the bar's
 * Alerts tab) gets its own step. Page steps stay compact and keep the tooltip
 * below the highlight so it stays inside the viewport. Profile and Settings
 * live in the header dropdown and get a two-stage prompt.
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
    target: pageTarget('[data-tour="student-stats"]'),
    content: 'Your CGPA, the materials count and the vendor count, all tappable straight from here.',
    title: 'Your academic snapshot',
    route: '/dashboard',
    placement: 'top',
  }),
  mobileStep({
    target: navTarget,
    content: 'Use this bar to jump between Home, Materials, Accommodation, Market and Updates.',
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
    content: 'Lecture notes, past questions and study materials. Filter by level, semester or type, and bookmark what you want to keep.',
    title: 'Materials library',
    route: '/dashboard/materials',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-accommodation"]'),
    content: 'Verified student housing near campus. Spotted a vacancy? Submit it, then track its verification under My Submissions.',
    title: 'Accommodation',
    route: '/dashboard/accommodation',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-market-tabs"]'),
    content: 'Market is now the single home for the campus economy. This tab switches between verified vendors and peer-to-peer listings.',
    title: 'Market: vendors and marketplace',
    route: '/dashboard/market',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-marketplace"]', '[data-tour="page-market"]'),
    content: 'Search and filter listings, tap Sell to run the guided listing wizard, and manage what you have posted under My listings.',
    title: 'Buy and sell on campus',
    route: '/dashboard/market',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-notifications"]'),
    content: 'Announcements, vendor updates and activity alerts, all in one feed.',
    title: 'Notifications',
    route: '/dashboard/notifications',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-announcements"]'),
    content: 'The full feed of department and university announcements, newest first.',
    title: 'Announcements',
    route: '/dashboard/announcements',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-profile"]'),
    content: 'Update your personal details and matric number, and review your subscription status.',
    title: 'Your profile',
    route: '/dashboard/profile',
    placement: 'bottom',
  }),
  mobileStep({
    target: pageTarget('[data-tour="page-settings"]'),
    content: 'Pick a theme, choose which notifications you get, and set your preferences.',
    title: 'Settings',
    route: '/dashboard/settings',
    placement: 'bottom',
  }),
  MOBILE_CLOSING_STEP,
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
      target: visibleTarget('[data-tour="vendor-stats"]', '[data-tour="vendor-welcome"]'),
      content: 'Views, contacts, average rating and conversion rate for your listing.',
      title: 'Your performance',
      route: '/dashboard',
      placement: 'top',
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
      target: pageTarget('[data-tour="page-subscription"]'),
      content: 'Manage your subscription plan, view billing history, and upgrade or cancel.',
      title: 'Subscription',
      route: '/dashboard/subscription',
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
    MOBILE_CLOSING_STEP,
  ];
}
