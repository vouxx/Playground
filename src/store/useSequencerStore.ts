import { create } from 'zustand';
import type { DrumType, Track } from '@/types';
import { DRUM_KIT, STEP_COUNT } from '@/types';

interface SequencerState {
  tracks: Track[];
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  toggleStep: (trackId: DrumType, step: number) => void;
  setBpm: (bpm: number) => void;
  setPlaying: (playing: boolean) => void;
  setCurrentStep: (step: number) => void;
  setVolume: (trackId: DrumType, volume: number) => void;
  toggleMute: (trackId: DrumType) => void;
  toggleSolo: (trackId: DrumType) => void;
  clearPattern: () => void;
  isRecording: boolean;
  setRecording: (recording: boolean) => void;
  setStep: (trackId: DrumType, step: number, value: boolean) => void;
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

export const useSequencerStore = create<SequencerState>((set) => ({
  tracks: createInitialTracks(),
  bpm: 120,
  isPlaying: false,
  currentStep: -1,
  isRecording: false,

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
      tracks: state.tracks.map((track) =>
        track.id === trackId
          ? { ...track, steps: track.steps.map((s, i) => (i === step ? !s : s)) }
          : track,
      ),
    })),

  setBpm: (bpm) => set({ bpm: Math.min(200, Math.max(60, bpm)) }),

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
      tracks: state.tracks.map((track) => ({
        ...track,
        steps: Array(STEP_COUNT).fill(false),
      })),
    })),
}));
