'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Joyride,
  ACTIONS,
  EVENTS,
  STATUS,
  type EventData,
  type Step,
} from 'react-joyride';
import { useTourStore } from './tour-store';
import {
  studentTourSteps,
  vendorTourSteps,
  studentMobileTourSteps,
  vendorMobileTourSteps,
  type TourKind,
  type TourStep,
} from './tour-steps';


const STORAGE_PREFIX = 'unihub_tour_';
const STORAGE_DONE = 'done';

function storageKey(tour: TourKind, userId: string) {
  return `${STORAGE_PREFIX}${tour}_${userId}`;
}

function hasSeenTour(tour: TourKind, userId: string) {
  if (typeof window === 'undefined') return true;
  try {
    return localStorage.getItem(storageKey(tour, userId)) === STORAGE_DONE;
  } catch {
    return false;
  }
}

function markTourSeen(tour: TourKind, userId: string) {
  try {
    localStorage.setItem(storageKey(tour, userId), STORAGE_DONE);
  } catch {
    // ignore
  }
}

/**
 * Tracks the `md` breakpoint used by the dashboard layout. Updates on resize /
 * orientation change so the correct step set is always used.
 */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767.98px)').matches,
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767.98px)');
    const update = () => setIsMobile(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  return isMobile;
}



interface OnboardingTourProps {
  isVendorView: boolean;
  hasToggle: boolean;
  userId: string;
}

export function OnboardingTour({ isVendorView, hasToggle, userId }: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [debugLines, setDebugLines] = useState<string[]>([]);
  const [tick, setTick] = useState(0);

  const run = useTourStore((s) => s.run);
  const tour = useTourStore((s) => s.tour);
  const stepIndex = useTourStore((s) => s.stepIndex);
  const pendingRoute = useTourStore((s) => s.pendingRoute);
  const pendingIndex = useTourStore((s) => s.pendingIndex);
  const session = useTourStore((s) => s.session);
  const start = useTourStore((s) => s.start);
  const stop = useTourStore((s) => s.stop);
  const setStepIndex = useTourStore((s) => s.setStepIndex);
  const setPending = useTourStore((s) => s.setPending);
  const clearPending = useTourStore((s) => s.clearPending);

  const isMobile = useIsMobile();

  const steps = useMemo<TourStep[]>(() => {
    if (tour === 'vendor') {
      return isMobile ? vendorMobileTourSteps() : vendorTourSteps(hasToggle);
    }
    return isMobile ? studentMobileTourSteps : studentTourSteps;
  }, [tour, hasToggle, isMobile]);

  const stepsRef = useRef(steps);
  useEffect(() => { stepsRef.current = steps; });
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; });

  // Guard against the steps array shrinking when the viewport crosses the
  // mobile breakpoint while the tour is running.
  useEffect(() => {
    if (!run || stepIndex < steps.length) return;
    setStepIndex(Math.max(0, steps.length - 1));
  }, [run, stepIndex, steps.length, setStepIndex]);

  // Auto-start the appropriate tour on first visit.
  useEffect(() => {
    if (run) return;
    const kind: TourKind = isVendorView ? 'vendor' : 'student';
    const forceStart =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).has('tourStart');
    if (hasSeenTour(kind, userId) && !forceStart) return;

    // If the first step points to a different route, start immediately so
    // navigation effect will redirect to the step route. If the first step
    // targets the current route, wait for the target DOM node to exist
    // (hydration/render) before starting the tour, falling back after timeout.
    const first = stepsRef.current[0];

    let cancelled = false;

    async function waitForAndStart() {
      if (first?.route && first.route !== pathnameRef.current) {
        start(kind);
        return;
      }

      const maxWait = 3000; // ms
      const interval = 100; // ms
      const deadline = Date.now() + maxWait;
      const target = first?.target;

      const resolveTarget = () => {
        try {
          if (typeof target === 'function') {
            return (target as () => HTMLElement | null)();
          }
          if (typeof target === 'string') {
            return document.querySelector(target as string);
          }
          return null;
        } catch {
          return null;
        }
      };

      while (!cancelled && Date.now() < deadline) {
        const el = resolveTarget();
        if (el) {
          start(kind);
          return;
        }
        await new Promise((r) => setTimeout(r, interval));
      }

      // Fallback: start anyway if target never appeared.
      if (!cancelled) start(kind);
    }

    waitForAndStart();

    return () => {
      cancelled = true;
    };
  }, [isVendorView, userId, run, start]);

  // Navigate to the first step's page when the tour starts elsewhere.
  useEffect(() => {
    if (!run) return;
    const first = stepsRef.current[0];
    if (first?.route && first.route !== pathnameRef.current) {
      router.push(first.route);
    }
  }, [run, router]);

  // After navigating to a pending step's page, advance the tour.
  useEffect(() => {
    if (!run || pendingIndex === null || !pendingRoute) return;
    if (pathname !== pendingRoute) return;
    const timer = window.setTimeout(() => {
      setStepIndex(pendingIndex);
      clearPending();
    }, 300);
    return () => window.clearTimeout(timer);
  }, [run, pathname, pendingRoute, pendingIndex, setStepIndex, clearPending]);

  // Follow manual navigation while the tour is running.
  const wasRunningRef = useRef(false);
  useEffect(() => {
    if (!run) {
      wasRunningRef.current = false;
      return;
    }
    if (!wasRunningRef.current) {
      wasRunningRef.current = true;
      return;
    }
    if (pendingIndex !== null) return;
    const current = stepsRef.current[stepIndex];
    if (!current?.route || current.route === pathname) return;
    const idx = stepsRef.current.findIndex((s) => s.route === pathname);
    if (idx !== -1 && idx !== stepIndex) setStepIndex(idx);
  }, [run, pathname, stepIndex, pendingIndex, setStepIndex]);

  const handleEvent = useCallback(
    (data: EventData) => {
      if (!run) return;
      const { type, action, index, status } = data;

      const debugOn =
        typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).has('tourDebug');

      if (debugOn) {
        const lifecycle = (data as { lifecycle?: string }).lifecycle ?? '-';
        setDebugLines((prev) =>
          [
            ...prev,
            `${new Date().toISOString().slice(11, 23)} ev=${type} act=${action} idx=${index} st=${status} lc=${lifecycle}`,
          ].slice(-14),
        );
      }

      if (
        type === EVENTS.TOUR_END &&
        (status === STATUS.FINISHED || status === STATUS.SKIPPED)
      ) {
        if (tour) markTourSeen(tour, userId);
        stop();
        return;
      }

      if (type === EVENTS.STEP_AFTER) {
        const delta = action === ACTIONS.PREV ? -1 : 1;
        const nextIndex = index + delta;
        if (nextIndex < 0 || nextIndex >= stepsRef.current.length) {
          if (tour) markTourSeen(tour, userId);
          stop();
          return;
        }
        const nextStep = stepsRef.current[nextIndex];
        if (nextStep.route && nextStep.route !== pathnameRef.current) {
          setPending(nextStep.route, nextIndex);
          router.push(nextStep.route);
        } else {
          setStepIndex(nextIndex);
        }
      }
    },
    [run, tour, userId, setPending, setStepIndex, stop, router],
  );

  const debugOn =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).has('tourDebug');

  useEffect(() => {
    if (!debugOn) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 500);
    return () => window.clearInterval(id);
  }, [debugOn]);

  const debugData = useMemo(() => {
    if (typeof window === 'undefined') return null;

    const cur = steps[stepIndex];
    let targetRect = '-';
    if (cur?.target) {
      try {
        const el =
          typeof cur.target === 'function'
            ? (cur.target as () => HTMLElement | null)()
            : typeof cur.target === 'string'
              ? document.querySelector(cur.target)
              : null;
        if (el) {
          const r = (el as HTMLElement).getBoundingClientRect();
          targetRect = `x=${Math.round(r.left)} y=${Math.round(r.top)} w=${Math.round(r.width)} h=${Math.round(r.height)}`;
        } else {
          targetRect = 'NOT FOUND';
        }
      } catch {
        targetRect = 'target err';
      }
    }

    const floater = document.querySelector<HTMLElement>('.react-joyride__floater');
    let floaterRect = '-';
    if (floater) {
      const r = floater.getBoundingClientRect();
      const cs = getComputedStyle(floater);
      floaterRect = `x=${Math.round(r.left)} y=${Math.round(r.top)} w=${Math.round(r.width)} h=${Math.round(r.height)} pos=${cs.position} left=${cs.left} top=${cs.top} op=${cs.opacity} disp=${cs.display}`;
    }

    return {
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      mobile: isMobile,
      pathname,
      run,
      tour,
      stepIndex,
      targetRoute: cur?.route ?? '-',
      targetRect,
      floaterRect,
      overlay: document.querySelector('.react-joyride__overlay') ? 'yes' : 'no',
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, stepIndex, pathname, run, tour, isMobile, debugLines, tick]);

  return (
    <>
      <Joyride
      key={session}
      steps={steps as Step[]}
      run={run}
      stepIndex={stepIndex}
      continuous
      scrollToFirstStep
      onEvent={handleEvent}
      styles={{
        tooltip: { borderRadius: 14, padding: '18px 20px' },
        tooltipTitle: { fontSize: 17, fontWeight: 700 },
        tooltipContent: { fontSize: 14, lineHeight: 1.55 },
        buttonPrimary: {
          backgroundColor: '#2563eb',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
        },
        buttonBack: { color: '#2563eb', borderRadius: 8, fontSize: 14 },
        buttonSkip: { color: '#64748b', borderRadius: 8, fontSize: 14 },
        buttonClose: { color: '#94a3b8', fontSize: 16 },
      }}
      options={{
        skipBeacon: true,
        showProgress: true,
        targetWaitTimeout: 10000,
        buttons: ['back', 'skip', 'primary'],
        closeButtonAction: 'skip',
        overlayClickAction: false,
        dismissKeyAction: false,
        primaryColor: '#2563eb',
        textColor: '#0f172a',
        spotlightPadding: 10,
        zIndex: 120,
      }}
      />
      {debugOn && debugData && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            zIndex: 9999,
            width: 440,
            maxWidth: '100vw',
            maxHeight: '72vh',
            overflow: 'auto',
            background: 'rgba(15,23,42,0.94)',
            color: '#e2e8f0',
            fontSize: 10,
            lineHeight: 1.5,
            fontFamily: 'monospace',
            padding: 8,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-all',
            pointerEvents: 'auto',
          }}
        >
          <div>win={debugData.windowSize} mobile={String(debugData.mobile)}</div>
          <div>
            route={debugData.pathname} run={String(debugData.run)} tour={debugData.tour} idx={debugData.stepIndex}
          </div>
          <div>overlay={debugData.overlay}</div>
          <div>target[{debugData.targetRoute}]: {debugData.targetRect}</div>
          <div>floater: {debugData.floaterRect}</div>
          <div>events:</div>
          {[...debugLines].reverse().map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </>
  );
}
