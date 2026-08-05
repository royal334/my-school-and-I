'use client';

import { create } from 'zustand';
import type { TourKind } from './tour-steps';

interface TourStore {
  run: boolean;
  tour: TourKind | null;
  stepIndex: number;
  session: number;
  pendingRoute: string | null;
  pendingIndex: number | null;
  start: (tour: TourKind) => void;
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
  pendingRoute: null,
  pendingIndex: null,
  start: (tour) =>
    set((s) => ({
      run: true,
      tour,
      stepIndex: 0,
      session: s.session + 1,
      pendingRoute: null,
      pendingIndex: null,
    })),
  stop: () =>
    set({ run: false, tour: null, stepIndex: 0, pendingRoute: null, pendingIndex: null }),
  setStepIndex: (index) => set({ stepIndex: index }),
  setPending: (route, index) => set({ pendingRoute: route, pendingIndex: index }),
  clearPending: () => set({ pendingRoute: null, pendingIndex: null }),
}));
