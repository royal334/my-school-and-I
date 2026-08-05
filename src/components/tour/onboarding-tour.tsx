'use client';

import { useCallback, useEffect, useMemo, useRef } from 'react';
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



interface OnboardingTourProps {
  isVendorView: boolean;
  hasToggle: boolean;
  userId: string;
}

export function OnboardingTour({ isVendorView, hasToggle, userId }: OnboardingTourProps) {
  const router = useRouter();
  const pathname = usePathname();


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

  const steps = useMemo<TourStep[]>(
    () => (tour === 'vendor' ? vendorTourSteps(hasToggle) : studentTourSteps),
    [tour, hasToggle],
  );

  const stepsRef = useRef(steps);
  useEffect(() => { stepsRef.current = steps; });
  const pathnameRef = useRef(pathname);
  useEffect(() => { pathnameRef.current = pathname; });

  // Auto-start the appropriate tour on first visit.
  useEffect(() => {
    if (run) return;
    const kind: TourKind = isVendorView ? 'vendor' : 'student';
    if (hasSeenTour(kind, userId)) return;

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
            return (target as any)();
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
        // eslint-disable-next-line no-await-in-loop
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

  return (
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
  );
}
