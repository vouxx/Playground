import { create } from 'zustand';
import type { Region } from '@/types/daw';
import { DEFAULT_REGION_DURATION } from '@/types/daw';

interface RegionStore {
  regions: Record<string, Region>;
  regionCount: number;

  addRegion: (trackId: string, startTick: number, durationTicks?: number) => string;
  removeRegion: (id: string) => void;
  removeRegionsByTrack: (trackId: string) => void;
  moveRegion: (id: string, trackId: string, startTick: number) => void;
  resizeRegion: (id: string, durationTicks: number) => void;
  getRegionsByTrack: (trackId: string) => Region[];
}

export const useRegionStore = create<RegionStore>((set, get) => ({
  regions: {},
  regionCount: 0,

  addRegion: (trackId, startTick, durationTicks = DEFAULT_REGION_DURATION) => {
    const id = crypto.randomUUID();
    const count = get().regionCount + 1;
    const region: Region = {
      id,
      trackId,
      startTick: Math.max(0, startTick),
      durationTicks: Math.max(1, durationTicks),
      name: `Region ${count}`,
    };
    set((s) => ({
      regions: { ...s.regions, [id]: region },
      regionCount: count,
    }));
    return id;
  },

  removeRegion: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.regions;
      return { regions: rest };
    }),

  removeRegionsByTrack: (trackId) =>
    set((s) => {
      const filtered: Record<string, Region> = {};
      for (const [id, region] of Object.entries(s.regions)) {
        if (region.trackId !== trackId) filtered[id] = region;
      }
      return { regions: filtered };
    }),

  moveRegion: (id, trackId, startTick) =>
    set((s) => {
      const region = s.regions[id];
      if (!region) return s;
      return {
        regions: {
          ...s.regions,
          [id]: { ...region, trackId, startTick: Math.max(0, startTick) },
        },
      };
    }),

  resizeRegion: (id, durationTicks) =>
    set((s) => {
      const region = s.regions[id];
      if (!region) return s;
      return {
        regions: {
          ...s.regions,
          [id]: { ...region, durationTicks: Math.max(1, durationTicks) },
        },
      };
    }),

  getRegionsByTrack: (trackId) => {
    return Object.values(get().regions).filter((r) => r.trackId === trackId);
  },
}));
