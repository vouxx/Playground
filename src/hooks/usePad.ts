'use client';

import { useCallback, useEffect } from 'react';
import { useSequencerStore } from '@/store/useSequencerStore';
import { initAudio, triggerDrum } from '@/lib/audio';
import type { DrumType } from '@/types';

const KEY_MAP: Record<string, DrumType> = {
  q: 'kick',
  w: 'snare',
  e: 'hihat',
  r: 'openhat',
  a: 'clap',
  s: 'rim',
  d: 'tom',
  f: 'cymbal',
};

export function usePad() {
  const triggerPad = useCallback(async (drum: DrumType) => {
    await initAudio();
    triggerDrum(drum, 0);

    const { isRecording, isPlaying, currentStep } = useSequencerStore.getState();
    if (isRecording && isPlaying && currentStep >= 0) {
      useSequencerStore.getState().setStep(drum, currentStep, true);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const drum = KEY_MAP[e.key.toLowerCase()];
      if (drum) triggerPad(drum);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [triggerPad]);

  return { triggerPad, KEY_MAP };
}
