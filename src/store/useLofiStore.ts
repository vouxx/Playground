import { create } from 'zustand';
import type { LofiMood } from '@/engine/lofi';

interface LofiState {
  isPlaying: boolean;
  mood: LofiMood;
  bpm: number;
  filterFreq: number;
  crackle: number;
  volume: number;

  play: () => void;
  stop: () => void;
  setMood: (mood: LofiMood) => void;
  setBpm: (bpm: number) => void;
  setFilterFreq: (freq: number) => void;
  setCrackle: (vol: number) => void;
  setVolume: (vol: number) => void;
}

export const useLofiStore = create<LofiState>((set) => ({
  isPlaying: false,
  mood: 'chill',
  bpm: 75,
  filterFreq: 800,
  crackle: 0.15,
  volume: 0.7,

  play: () => set({ isPlaying: true }),
  stop: () => set({ isPlaying: false }),
  setMood: (mood) => set({ mood }),
  setBpm: (bpm) => set({ bpm: Math.max(50, Math.min(100, bpm)) }),
  setFilterFreq: (filterFreq) => set({ filterFreq: Math.max(200, Math.min(5000, filterFreq)) }),
  setCrackle: (crackle) => set({ crackle: Math.max(0, Math.min(0.5, crackle)) }),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
}));
