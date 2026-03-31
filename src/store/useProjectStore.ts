import { create } from 'zustand';
import { MIN_BPM, MAX_BPM } from '@/types/daw';

interface ProjectStore {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  trackOrder: string[];

  setBpm: (bpm: number) => void;
  setTimeSignature: (ts: [number, number]) => void;
  setName: (name: string) => void;
  addTrackToOrder: (trackId: string) => void;
  removeTrackFromOrder: (trackId: string) => void;
  reorderTracks: (fromIndex: number, toIndex: number) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  id: crypto.randomUUID(),
  name: 'Untitled Project',
  bpm: 120,
  timeSignature: [4, 4] as [number, number],
  trackOrder: [],

  setBpm: (bpm) =>
    set({ bpm: Math.max(MIN_BPM, Math.min(MAX_BPM, Math.round(bpm))) }),

  setTimeSignature: (ts) => set({ timeSignature: ts }),

  setName: (name) => set({ name }),

  addTrackToOrder: (trackId) =>
    set((s) => ({ trackOrder: [...s.trackOrder, trackId] })),

  removeTrackFromOrder: (trackId) =>
    set((s) => ({ trackOrder: s.trackOrder.filter((id) => id !== trackId) })),

  reorderTracks: (fromIndex, toIndex) =>
    set((s) => {
      const order = [...s.trackOrder];
      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      return { trackOrder: order };
    }),
}));
