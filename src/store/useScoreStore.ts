import { create } from 'zustand';

interface ScoreStore {
  isOpen: boolean;
  trackId: string | null;
  keySignature: string;  // e.g. "C", "G", "D"
  scrollX: number;

  openScore: (trackId: string) => void;
  closeScore: () => void;
  setKeySignature: (key: string) => void;
  setScrollX: (x: number) => void;
}

export const useScoreStore = create<ScoreStore>((set) => ({
  isOpen: false,
  trackId: null,
  keySignature: 'C',
  scrollX: 0,

  openScore: (trackId) => set({ isOpen: true, trackId, scrollX: 0 }),
  closeScore: () => set({ isOpen: false, trackId: null }),
  setKeySignature: (key) => set({ keySignature: key }),
  setScrollX: (x) => set({ scrollX: Math.max(0, x) }),
}));
