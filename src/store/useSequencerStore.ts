import { create } from 'zustand';
import type { DrumType, Track } from '@/types';
import { DRUM_KIT, STEP_COUNT } from '@/types';
import type { BeatPreset } from '@/lib/presets';

const MAX_HISTORY = 30;

interface SequencerState {
  tracks: Track[];
  bpm: number;
  swing: number;
  isPlaying: boolean;
  currentStep: number;
  isRecording: boolean;
  history: Track[][];
  future: Track[][];
  toggleStep: (trackId: DrumType, step: number) => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: number) => void;
  setVolume: (trackId: DrumType, volume: number) => void;
  toggleMute: (trackId: DrumType) => void;
  toggleSolo: (trackId: DrumType) => void;
  clearPattern: () => void;
  setRecording: (recording: boolean) => void;
  setStep: (trackId: DrumType, step: number, value: boolean) => void;
  loadPreset: (preset: BeatPreset) => void;
  undo: () => void;
  redo: () => void;
}

function createInitialTracks(): Track[] {
  return DRUM_KIT.map(({ id, name }) => ({
    id,
    name,
    steps: Array(STEP_COUNT).fill(false),
    volume: 80,
    mute: false,
    solo: false,
  }));
}

function cloneTracks(tracks: Track[]): Track[] {
  return tracks.map((t) => ({ ...t, steps: [...t.steps] }));
}

function pushHistory(state: SequencerState): Partial<SequencerState> {
  return {
    history: [...state.history.slice(-MAX_HISTORY + 1), cloneTracks(state.tracks)],
    future: [],
  };
}

export const useSequencerStore = create<SequencerState>((set) => ({
  tracks: createInitialTracks(),
  bpm: 120,
  swing: 0,
  isPlaying: false,
  currentStep: -1,
  isRecording: false,
  history: [],
  future: [],

  setRecording: (isRecording) => set({ isRecording }),

  setStep: (trackId, step, value) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, steps: track.steps.map((s, i) => (i === step ? value : s)) }
          : track,
      ),
    })),

  toggleStep: (trackId, step) =>
    set((state) => ({
      ...pushHistory(state),
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, steps: track.steps.map((s, i) => (i === step ? !s : s)) }
          : track,
      ),
    })),

  setBpm: (bpm) => set({ bpm: Math.min(200, Math.max(60, bpm)) }),

  setSwing: (swing) => set({ swing: Math.min(100, Math.max(0, swing)) }),

  setPlaying: (isPlaying) => set({ isPlaying, currentStep: isPlaying ? 0 : -1 }),

  setCurrentStep: (currentStep) => set({ currentStep }),

  setVolume: (trackId, volume) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, volume } : track,
      ),
    })),

  toggleMute: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, mute: !track.mute } : track,
      ),
    })),

  toggleSolo: (trackId) =>
    set((state) => ({
      tracks: state.tracks.map((track) =>
        track.id === trackId ? { ...track, solo: !track.solo } : track,
      ),
    })),

  clearPattern: () =>
    set((state) => ({
      ...pushHistory(state),
      tracks: state.tracks.map((track) => ({
        ...track,
        steps: Array(STEP_COUNT).fill(false),
      })),
    })),

  loadPreset: (preset) =>
    set((state) => ({
      ...pushHistory(state),
      tracks: state.tracks.map((track) => ({
        ...track,
        steps: preset.pattern[track.id] ? [...preset.pattern[track.id]] : track.steps,
      })),
    })),

  undo: () =>
    set((state) => {
      if (state.history.length === 0) return state;
      const prev = state.history[state.history.length - 1];
      return {
        tracks: prev,
        history: state.history.slice(0, -1),
        future: [cloneTracks(state.tracks), ...state.future],
      };
    }),

  redo: () =>
    set((state) => {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      return {
        tracks: next,
        history: [...state.history, cloneTracks(state.tracks)],
        future: state.future.slice(1),
      };
    }),
}));
