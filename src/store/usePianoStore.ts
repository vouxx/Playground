import { create } from 'zustand';
import type { PianoNote, SynthPreset } from '@/types';
import { PIANO_NOTES, STEP_COUNT } from '@/types';

type PianoGrid = Record<PianoNote, boolean[]>;

interface PianoState {
  grid: PianoGrid;
  preset: SynthPreset;
  volume: number;
  mute: boolean;
  toggleNote: (note: PianoNote, step: number) => void;
  setNoteOn: (note: PianoNote, step: number) => void;
  setPreset: (preset: SynthPreset) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  clearGrid: () => void;
  getActiveNotes: (step: number) => string[];
}

function createEmptyGrid(): PianoGrid {
  const grid = {} as PianoGrid;
  for (const note of PIANO_NOTES) {
    grid[note] = Array(STEP_COUNT).fill(false);
  }
  return grid;
}

export const usePianoStore = create<PianoState>((set, get) => ({
  grid: createEmptyGrid(),
  preset: 'sine',
  volume: 70,
  mute: false,

  toggleNote: (note, step) =>
    set((state) => ({
      grid: {
        ...state.grid,
        [note]: state.grid[note].map((v, i) => (i === step ? !v : v)),
      },
    })),

  setNoteOn: (note, step) =>
    set((state) => ({
      grid: {
        ...state.grid,
        [note]: state.grid[note].map((v, i) => (i === step ? true : v)),
      },
    })),

  setPreset: (preset) => set({ preset }),

  setVolume: (volume) => set({ volume }),

  toggleMute: () => set((state) => ({ mute: !state.mute })),

  clearGrid: () => set({ grid: createEmptyGrid() }),

  getActiveNotes: (step) => {
    const { grid } = get();
    return PIANO_NOTES.filter((note) => grid[note][step]);
  },
}));
