'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const REVEAL_DELAY_MS = 150;
const SAFETY_TIMEOUT_MS = 8000;

export function PageLoader() {
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Debug aid: set localStorage 'engiportal:loaderDesktop' to '1' to also show
  // the overlay on desktop-sized screens while testing.
  const [ignoreBreakpoint] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('engiportal:loaderDesktop') === '1'
  );

  const committedPathRef = useRef(pathname);
  const visibleRef = useRef(false);
  const revealTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelTimers = useCallback(() => {
    if (revealTimer.current) clearTimeout(revealTimer.current);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    revealTimer.current = null;
    hideTimer.current = null;
  }, []);

  const hide = useCallback(() => {
    cancelTimers();
    visibleRef.current = false;
    setVisible(false);
  }, [cancelTimers]);

  const showSoon = useCallback(() => {
    if (visibleRef.current) return;
    if (revealTimer.current) clearTimeout(revealTimer.current);
    revealTimer.current = setTimeout(() => {
      visibleRef.current = true;
      setVisible(true);
      hideTimer.current = setTimeout(hide, SAFETY_TIMEOUT_MS);
    }, REVEAL_DELAY_MS);
  }, [hide]);

  // A committed route change hides the overlay.
  useEffect(() => {
    if (pathname === committedPathRef.current) return;
    committedPathRef.current = pathname;
    hide();
  }, [pathname, hide]);

  // Detect client-side navigation start.
  useEffect(() => {
    const isActualPageChange = () =>
      window.location.pathname !== committedPathRef.current;

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
      let samePage = false;
      try {
        const next = new URL(url, window.location.href);
        if (next.origin !== window.location.origin) return;
        samePage = next.pathname === window.location.pathname;
      } catch {
        return;
      }
      if (samePage) return;
      showSoon();
    };

    // Fallback for programmatic `router.push()` calls that don't go through an
    // <a> element. Best-effort: Next may call the unpatched history funcs.
    const nativePushState = history.pushState.bind(history);
    const nativeReplaceState = history.replaceState.bind(history);

    history.pushState = (...args: Parameters<History['pushState']>) => {
      nativePushState(...args);
      window.dispatchEvent(new Event('engiportal:navigate'));
    };

    history.replaceState = (...args: Parameters<History['replaceState']>) => {
      nativeReplaceState(...args);
      window.dispatchEvent(new Event('engiportal:navigate'));
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('engiportal:navigate', trigger);
    window.addEventListener('popstate', trigger);

    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('engiportal:navigate', trigger);
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
      className={`fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 overflow-hidden bg-[#E8F5EF]/85 dark:bg-[#0B1411]/85${ignoreBreakpoint ? '' : ' md:hidden'}`}
      style={{
        animation: 'engiportal-overlay-in 220ms ease-out',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(126,200,160,0.35) 0%, rgba(26,122,82,0.12) 45%, transparent 72%)',
        }}
      />

      {/* Spinner */}
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#4A8C73]/20 dark:border-[#7EC8A0]/20" />
        <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#7EC8A0] border-r-[#4A8C73]/70 motion-reduce:animate-none" />
        <div className="absolute inset-3.5 animate-pulse rounded-full bg-[#7EC8A0]/20 dark:bg-[#7EC8A0]/25 motion-reduce:animate-none" />
        <div className="absolute inset-0 grid place-items-center">
          <span
            className="text-base text-[#1A3C34] dark:text-[#7EC8A0]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            CH
          </span>
        </div>
      </div>

      <p className="text-[13px] font-medium tracking-wide text-[#1A3C34]/60 dark:text-[#AFC5BB]">
        Loading…
      </p>

      <style>{`
        @keyframes engiportal-overlay-in {
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