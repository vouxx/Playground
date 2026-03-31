import { create } from 'zustand';
import {
  DEFAULT_PIXELS_PER_TICK,
  MIN_PIXELS_PER_TICK,
  MAX_PIXELS_PER_TICK,
} from '@/types/daw';

const ZOOM_FACTOR = 1.2;

interface ViewportStore {
  scrollX: number;
  scrollY: number;
  pixelsPerTick: number;
  selectedRegionIds: string[];

  setScrollX: (x: number) => void;
  setScrollY: (y: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  setZoom: (pixelsPerTick: number) => void;
  selectRegion: (id: string, addToSelection?: boolean) => void;
  deselectAll: () => void;
}

function clampZoom(ppt: number): number {
  return Math.max(MIN_PIXELS_PER_TICK, Math.min(MAX_PIXELS_PER_TICK, ppt));
}

export const useViewportStore = create<ViewportStore>((set) => ({
  scrollX: 0,
  scrollY: 0,
  pixelsPerTick: DEFAULT_PIXELS_PER_TICK,
  selectedRegionIds: [],

  setScrollX: (x) => set({ scrollX: Math.max(0, x) }),

  setScrollY: (y) => set({ scrollY: Math.max(0, y) }),

  zoomIn: () =>
    set((s) => ({ pixelsPerTick: clampZoom(s.pixelsPerTick * ZOOM_FACTOR) })),

  zoomOut: () =>
    set((s) => ({ pixelsPerTick: clampZoom(s.pixelsPerTick / ZOOM_FACTOR) })),

  setZoom: (ppt) => set({ pixelsPerTick: clampZoom(ppt) }),

  selectRegion: (id, addToSelection = false) =>
    set((s) => ({
      selectedRegionIds: addToSelection
        ? s.selectedRegionIds.includes(id)
          ? s.selectedRegionIds.filter((rid) => rid !== id)
          : [...s.selectedRegionIds, id]
        : [id],
    })),

  deselectAll: () => set({ selectedRegionIds: [] }),
}));
