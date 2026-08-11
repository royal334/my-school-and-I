'use client';

import { create } from 'zustand';
import type { TourKind } from './tour-steps';

export type TourSource = 'auto' | 'manual';

interface TourStore {
  run: boolean;
  tour: TourKind | null;
  stepIndex: number;
  session: number;
  source: TourSource;
  pendingRoute: string | null;
  pendingIndex: number | null;
  start: (tour: TourKind, source?: TourSource) => void;
  stop: () => void;
  setStepIndex: (index: number) => void;
  setPending: (route: string, index: number) => void;
  clearPending: () => void;
}

export const useTourStore = create<TourStore>((set) => ({
  run: false,
  tour: null,
  stepIndex: 0,
  session: 0,
  source: 'auto',
  pendingRoute: null,
  pendingIndex: null,
  start: (tour, source = 'auto') =>
    set((s) => ({
      run: true,
      tour,
      source,
      stepIndex: 0,
      session: s.session + 1,
      pendingRoute: null,
      pendingIndex: null,
    })),
  stop: () =>
    set({ run: false, tour: null, stepIndex: 0, source: 'auto', pendingRoute: null, pendingIndex: null }),
  setStepIndex: (index) => set({ stepIndex: index }),
  setPending: (route, index) => set({ pendingRoute: route, pendingIndex: index }),
  clearPending: () => set({ pendingRoute: null, pendingIndex: null }),
}));
