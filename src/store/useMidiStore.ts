import { create } from 'zustand';
import type { MidiNote } from '@/types/daw';
import { PPQ } from '@/types/daw';

interface MidiStore {
  notes: Record<string, MidiNote>;
  noteCount: number;

  addNote: (regionId: string, pitch: number, startTick: number, durationTicks?: number, velocity?: number) => string;
  removeNote: (id: string) => void;
  removeNotesByRegion: (regionId: string) => void;
  moveNote: (id: string, pitch: number, startTick: number) => void;
  resizeNote: (id: string, durationTicks: number) => void;
  setVelocity: (id: string, velocity: number) => void;
  getNotesByRegion: (regionId: string) => MidiNote[];
}

export const useMidiStore = create<MidiStore>((set, get) => ({
  notes: {},
  noteCount: 0,

  addNote: (regionId, pitch, startTick, durationTicks = PPQ, velocity = 100) => {
    const id = crypto.randomUUID();
    const count = get().noteCount + 1;
    const note: MidiNote = {
      id,
      regionId,
      pitch: Math.max(0, Math.min(127, pitch)),
      startTick: Math.max(0, startTick),
      durationTicks: Math.max(1, durationTicks),
      velocity: Math.max(1, Math.min(127, velocity)),
    };
    set((s) => ({ notes: { ...s.notes, [id]: note }, noteCount: count }));
    return id;
  },

  removeNote: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.notes;
      return { notes: rest };
    }),

  removeNotesByRegion: (regionId) =>
    set((s) => {
      const filtered: Record<string, MidiNote> = {};
      for (const [id, note] of Object.entries(s.notes)) {
        if (note.regionId !== regionId) filtered[id] = note;
      }
      return { notes: filtered };
    }),

  moveNote: (id, pitch, startTick) =>
    set((s) => {
      const note = s.notes[id];
      if (!note) return s;
      return {
        notes: {
          ...s.notes,
          [id]: {
            ...note,
            pitch: Math.max(0, Math.min(127, pitch)),
            startTick: Math.max(0, startTick),
          },
        },
      };
    }),

  resizeNote: (id, durationTicks) =>
    set((s) => {
      const note = s.notes[id];
      if (!note) return s;
      return {
        notes: {
          ...s.notes,
          [id]: { ...note, durationTicks: Math.max(1, durationTicks) },
        },
      };
    }),

  setVelocity: (id, velocity) =>
    set((s) => {
      const note = s.notes[id];
      if (!note) return s;
      return {
        notes: {
          ...s.notes,
          [id]: { ...note, velocity: Math.max(1, Math.min(127, velocity)) },
        },
      };
    }),

  getNotesByRegion: (regionId) =>
    Object.values(get().notes).filter((n) => n.regionId === regionId),
}));
