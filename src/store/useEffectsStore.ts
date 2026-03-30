import { create } from 'zustand';
import type { EffectState } from '@/lib/effects';

interface EffectsStoreState extends EffectState {
  setReverb: (v: number) => void;
  setDelay: (v: number) => void;
  setDistortion: (v: number) => void;
  setFilter: (v: number) => void;
}

export const useEffectsStore = create<EffectsStoreState>((set) => ({
  reverb: 0,
  delay: 0,
  distortion: 0,
  filter: 100,
  setReverb: (reverb) => set({ reverb }),
  setDelay: (delay) => set({ delay }),
  setDistortion: (distortion) => set({ distortion }),
  setFilter: (filter) => set({ filter }),
}));
