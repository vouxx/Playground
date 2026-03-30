'use client';

import { useCallback, useRef } from 'react';
import { useSequencerStore } from '@/store/useSequencerStore';

const MAX_TAPS = 4;
const TAP_TIMEOUT = 2000;

export function useTapTempo() {
  const taps = useRef<number[]>([]);

  const tap = useCallback(() => {
    const now = Date.now();

    if (taps.current.length > 0 && now - taps.current[taps.current.length - 1] > TAP_TIMEOUT) {
      taps.current = [];
    }

    taps.current.push(now);

    if (taps.current.length > MAX_TAPS) {
      taps.current = taps.current.slice(-MAX_TAPS);
    }

    if (taps.current.length >= 2) {
      const intervals = [];
      for (let i = 1; i < taps.current.length; i++) {
        intervals.push(taps.current[i] - taps.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval);
      useSequencerStore.getState().setBpm(bpm);
    }
  }, []);

  return { tap };
}
