import { create } from 'zustand';
import type { Track, TrackType, MixerState } from '@/types/daw';
import { TRACK_COLORS, MIN_VOLUME_DB, MAX_VOLUME_DB } from '@/types/daw';

interface TrackStore {
  tracks: Record<string, Track>;
  trackCount: number;

  addTrack: (type?: TrackType) => string;
  removeTrack: (id: string) => void;
  duplicateTrack: (id: string) => string | null;
  updateTrack: (id: string, updates: Partial<Omit<Track, 'id'>>) => void;
  setVolume: (id: string, volume: number) => void;
  setPan: (id: string, pan: number) => void;
  toggleMute: (id: string) => void;
  toggleSolo: (id: string) => void;
}

function clampVolume(v: number): number {
  if (v === -Infinity) return -Infinity;
  return Math.max(MIN_VOLUME_DB, Math.min(MAX_VOLUME_DB, v));
}

function clampPan(p: number): number {
  return Math.max(-1, Math.min(1, p));
}

function defaultMixer(): MixerState {
  return { volume: 0, pan: 0, mute: false, solo: false };
}

export const useTrackStore = create<TrackStore>((set, get) => ({
  tracks: {},
  trackCount: 0,

  addTrack: (type = 'midi') => {
    const id = crypto.randomUUID();
    const count = get().trackCount + 1;
    const color = TRACK_COLORS[(count - 1) % TRACK_COLORS.length];
    const instrumentId = type === 'drum' ? 'drumkit' : type === 'audio' || type === 'return' ? '' : 'piano';
    const nameMap: Record<string, string> = { midi: 'Track', drum: 'Drums', audio: 'Audio', return: 'Return' };
    const track: Track = {
      id,
      name: `${nameMap[type]} ${count}`,
      type,
      color,
      mixer: defaultMixer(),
      instrumentId,
    };
    set((s) => ({
      tracks: { ...s.tracks, [id]: track },
      trackCount: count,
    }));
    return id;
  },

  removeTrack: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.tracks;
      return { tracks: rest };
    }),

  duplicateTrack: (id) => {
    const source = get().tracks[id];
    if (!source) return null;
    const newId = crypto.randomUUID();
    const count = get().trackCount + 1;
    const dup: Track = {
      ...source,
      id: newId,
      name: `${source.name} (Copy)`,
      mixer: { ...source.mixer },
      instrumentId: source.instrumentId,
    };
    set((s) => ({
      tracks: { ...s.tracks, [newId]: dup },
      trackCount: count,
    }));
    return newId;
  },

  updateTrack: (id, updates) =>
    set((s) => {
      const track = s.tracks[id];
      if (!track) return s;
      return { tracks: { ...s.tracks, [id]: { ...track, ...updates } } };
    }),

  setVolume: (id, volume) =>
    set((s) => {
      const track = s.tracks[id];
      if (!track) return s;
      return {
        tracks: {
          ...s.tracks,
          [id]: { ...track, mixer: { ...track.mixer, volume: clampVolume(volume) } },
        },
      };
    }),

  setPan: (id, pan) =>
    set((s) => {
      const track = s.tracks[id];
      if (!track) return s;
      return {
        tracks: {
          ...s.tracks,
          [id]: { ...track, mixer: { ...track.mixer, pan: clampPan(pan) } },
        },
      };
    }),

  toggleMute: (id) =>
    set((s) => {
      const track = s.tracks[id];
      if (!track) return s;
      return {
        tracks: {
          ...s.tracks,
          [id]: { ...track, mixer: { ...track.mixer, mute: !track.mixer.mute } },
        },
      };
    }),

  toggleSolo: (id) =>
    set((s) => {
      const track = s.tracks[id];
      if (!track) return s;
      return {
        tracks: {
          ...s.tracks,
          [id]: { ...track, mixer: { ...track.mixer, solo: !track.mixer.solo } },
        },
      };
    }),
}));
