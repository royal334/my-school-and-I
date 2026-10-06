'use client';

import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

const REVEAL_DELAY_MS = 150;
const SAFETY_TIMEOUT_MS = 8000;
const SHOW_LOADER_EVENT = 'campusandme:show-loader';

/** Show the mobile page loader for programmatic navigations (e.g. router.push). */
export function requestPageLoader() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(SHOW_LOADER_EVENT));
}

function routeKey(pathname: string, search: string) {
  return search ? `${pathname}?${search}` : pathname;
}

function PageLoaderInner() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentRoute = routeKey(pathname, searchParams.toString());

  // Debug aid: set localStorage 'campusandme:loaderDesktop' to '1' to also show
  // the overlay on desktop-sized screens while testing.
  const [ignoreBreakpoint] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('campusandme:loaderDesktop') === '1'
  );

  const committedPathRef = useRef(currentRoute);
  const visibleRef = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navStartPathRef = useRef<string | null>(null);

  const cancelTimers = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    revealTimer.current = null;
    hideTimer.current = null;
  }, []);

  const hide = useCallback(() => {
    cancelTimers();
    navStartPathRef.current = null;
    visibleRef.current = false;
    setVisible(false);
  }, [cancelTimers]);

  const showSoon = useCallback(() => {
    if (visibleRef.current) return;
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => {
      visibleRef.current = true;
      setVisible(true);
      navStartPathRef.current = routeKey(
        window.location.pathname,
        window.location.search.replace(/^\?/, ''),
      );
      // A committed route change calls `hide()`, which clears this timer. So
      // reaching here means the navigation stalled: warn the user instead of
      // leaving the overlay to vanish without explanation.
      hideTimer.current = setTimeout(() => {
        const now = routeKey(
          window.location.pathname,
          window.location.search.replace(/^\?/, ''),
        );
        if (navStartPathRef.current === now) {
          toast.warning('This page is taking longer than usual', {
            description:
              'We could not finish loading it. Check your connection, then try again.',
            duration: 8000,
            position: 'top-center',
          });
        }
        navStartPathRef.current = null;
        hide();
      }, SAFETY_TIMEOUT_MS);
    }, REVEAL_DELAY_MS);
  }, [hide]);

  // A committed route change (path or query) hides the overlay.
  useEffect(() => {
    if (currentRoute === committedPathRef.current) return;
    committedPathRef.current = currentRoute;
    hide();
  }, [currentRoute, hide]);

  // Detect client-side navigation start.
  useEffect(() => {
    const isActualPageChange = () =>
      routeKey(
        window.location.pathname,
        window.location.search.replace(/^\?/, ''),
      ) !== committedPathRef.current;

    const trigger = () => {
      if (isActualPageChange()) showSoon();
    };

    // Primary trigger: capture-phase click sniffing. Runs before `next/link`'s
    // own handler, so Next.js 16's internal history patching cannot bypass it.
    // (Next wraps history.pushState itself and fast-paths internal navigations
    // to the original function, which makes history-patching unreliable.)
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.('a');
      if (!anchor) return;
      if (anchor.target && anchor.target !== '_self') return;
      if (anchor.hasAttribute('download')) return;
      const url = anchor.getAttribute('href');
      if (!url || /^(#|mailto:|tel:|javascript:|data:)/i.test(url)) return;
      try {
        const next = new URL(url, window.location.href);
        if (next.origin !== window.location.origin) return;
        const nextKey = routeKey(next.pathname, next.search.replace(/^\?/, ''));
        const currentKey = routeKey(
          window.location.pathname,
          window.location.search.replace(/^\?/, ''),
        );
        if (nextKey === currentKey) return;
      } catch {
        return;
      }
      showSoon();
    };

    // Fallback for programmatic `router.push()` calls that don't go through an
    // <a> element. Best-effort: Next may call the unpatched history funcs.
    const nativePushState = history.pushState.bind(history);
    const nativeReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<History['pushState']>) => {
      nativePushState(...args);
      window.dispatchEvent(new Event('campusandme:navigate'));
    };

    history.replaceState = (...args: Parameters<History['replaceState']>) => {
      nativeReplaceState(...args);
      window.dispatchEvent(new Event('campusandme:navigate'));
    };

    const onShowRequest = () => showSoon();

    document.addEventListener('click', onClick, true);
    window.addEventListener('campusandme:navigate', trigger);
    window.addEventListener(SHOW_LOADER_EVENT, onShowRequest);
    window.addEventListener('popstate', trigger);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('campusandme:navigate', trigger);
      window.removeEventListener(SHOW_LOADER_EVENT, onShowRequest);
      window.removeEventListener('popstate', trigger);
      history.pushState = nativePushState;
      history.replaceState = nativeReplaceState;
      cancelTimers();
    };
  }, [showSoon, cancelTimers]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label="Loading page"
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 overflow-hidden bg-background/85 backdrop-blur-sm${ignoreBreakpoint ? '' : ' md:hidden'}`}
      style={{
        animation: 'campusandme-overlay-in 220ms ease-out',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, color-mix(in oklab, var(--primary) 32%, transparent) 0%, color-mix(in oklab, var(--primary) 10%, transparent) 45%, transparent 72%)',
        }}
      />

      {/* Spinner */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-primary border-r-primary/70 motion-reduce:animate-none" />
        <div className="absolute inset-3.5 animate-pulse rounded-full bg-primary/20 motion-reduce:animate-none" />
        <div className="absolute inset-0 grid place-items-center">
          <span
            className="text-base text-primary-600 dark:text-primary-300"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            C&M
          </span>
        </div>
      </div>

      <p className="text-[13px] font-medium tracking-wide text-muted-foreground">
        Loading…
      </p>

      <style>{`
        @keyframes campusandme-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-spin, .animate-pulse { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

export function PageLoader() {
  return (
    <Suspense fallback={null}>
      <PageLoaderInner />
    </Suspense>
  );
}
