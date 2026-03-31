'use client';

import { useEffect, useCallback, useRef } from 'react';
import { DRUM_PAD_MAPPINGS, triggerDrum } from '@/engine/drumkit';
import { useMidiStore } from '@/store/useMidiStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useRegionStore } from '@/store/useRegionStore';
import { ensureAudioContext } from '@/engine/transport';

/**
 * 전역 Musical Typing hook
 * Logic Pro X처럼 키보드로 드럼 비트를 즉시 입력한다.
 * DrumPadGrid 표시 여부와 무관하게 항상 동작한다.
 */
export function useMusicalTyping(activeRegionId: string | null) {
  const activeRegionIdRef = useRef(activeRegionId);
  activeRegionIdRef.current = activeRegionId;

  const triggerPad = useCallback(async (pitch: number) => {
    await ensureAudioContext();
    triggerDrum(pitch, undefined, 0.8);

    const { isPlaying, currentTick } = useTransportStore.getState();
    const regionId = activeRegionIdRef.current;

    if (isPlaying && regionId) {
      const region = useRegionStore.getState().regions[regionId];
      if (region) {
        const relativeTick = currentTick - region.startTick;
        if (relativeTick >= 0) {
          useMidiStore.getState().addNote(regionId, pitch, relativeTick, 192, 100);
        }
      }
    }
  }, []);

  useEffect(() => {
    const pressedKeys = new Set<string>();

    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const key = e.key.toLowerCase();

      // 키 반복(홀드) 방지
      if (pressedKeys.has(key)) return;

      const pad = DRUM_PAD_MAPPINGS.find((p) => p.keyTrigger === key);
      if (pad) {
        e.preventDefault();
        pressedKeys.add(key);
        triggerPad(pad.pitch);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      pressedKeys.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [triggerPad]);
}
