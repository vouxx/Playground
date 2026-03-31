import { create } from 'zustand';

interface TransportStore {
  isPlaying: boolean;
  currentTick: number;
  isMetronomeOn: boolean;
  /** true if was playing before last stop (for double-stop-to-zero) */
  wasPaused: boolean;

  play: () => void;
  stop: () => void;
  setPosition: (tick: number) => void;
  toggleMetronome: () => void;
  updateCurrentTick: (tick: number) => void;
}

export const useTransportStore = create<TransportStore>((set, get) => ({
  isPlaying: false,
  currentTick: 0,
  isMetronomeOn: true,
  wasPaused: false,

  play: () => set({ isPlaying: true, wasPaused: false }),

  stop: () => {
    const { isPlaying, wasPaused } = get();
    if (isPlaying) {
      // First stop: pause at current position
      set({ isPlaying: false, wasPaused: true });
    } else if (wasPaused) {
      // Second stop: go to beginning
      set({ currentTick: 0, wasPaused: false });
    }
  },

  setPosition: (tick) => set({ currentTick: Math.max(0, tick) }),

  toggleMetronome: () => set((s) => ({ isMetronomeOn: !s.isMetronomeOn })),

  updateCurrentTick: (tick) => set({ currentTick: tick }),
}));
