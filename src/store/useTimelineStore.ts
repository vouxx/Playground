import { create } from 'zustand';

const MAX_BARS = 8;

interface BarState {
  drumEnabled: boolean;
  pianoEnabled: boolean;
}

interface TimelineState {
  bars: BarState[];
  barCount: number;
  currentBar: number;
  masterVolume: number;
  isTimelineMode: boolean;
  setBarCount: (count: number) => void;
  toggleDrum: (barIndex: number) => void;
  togglePiano: (barIndex: number) => void;
  setCurrentBar: (bar: number) => void;
  setMasterVolume: (volume: number) => void;
  setTimelineMode: (mode: boolean) => void;
}

function createBars(): BarState[] {
  return Array.from({ length: MAX_BARS }, () => ({
    drumEnabled: true,
    pianoEnabled: true,
  }));
}

export const useTimelineStore = create<TimelineState>((set) => ({
  bars: createBars(),
  barCount: 4,
  currentBar: 0,
  masterVolume: 80,
  isTimelineMode: false,

  setBarCount: (barCount) => set({ barCount: Math.min(MAX_BARS, Math.max(1, barCount)) }),

  toggleDrum: (barIndex) =>
    set((state) => ({
      bars: state.bars.map((bar, i) =>
        i === barIndex ? { ...bar, drumEnabled: !bar.drumEnabled } : bar,
      ),
    })),

  togglePiano: (barIndex) =>
    set((state) => ({
      bars: state.bars.map((bar, i) =>
        i === barIndex ? { ...bar, pianoEnabled: !bar.pianoEnabled } : bar,
      ),
    })),

  setCurrentBar: (currentBar) => set({ currentBar }),

  setMasterVolume: (masterVolume) => set({ masterVolume }),

  setTimelineMode: (isTimelineMode) => set({ isTimelineMode }),
}));

export { MAX_BARS };
