import { create } from 'zustand';

interface PianoRollStore {
  openRegionId: string | null;
  scrollX: number;
  scrollY: number;
  pixelsPerTick: number;
  noteHeight: number;
  selectedNoteIds: string[];

  openRegion: (regionId: string) => void;
  closeRegion: () => void;
  setScrollX: (x: number) => void;
  setScrollY: (y: number) => void;
  setZoom: (ppt: number) => void;
  selectNote: (id: string, addToSelection?: boolean) => void;
  deselectAllNotes: () => void;
}

export const usePianoRollStore = create<PianoRollStore>((set) => ({
  openRegionId: null,
  scrollX: 0,
  scrollY: 0,
  pixelsPerTick: 0.5,
  noteHeight: 12,
  selectedNoteIds: [],

  openRegion: (regionId) => set({
    openRegionId: regionId,
    selectedNoteIds: [],
    // C4(60) 기준으로 스크롤 중앙 정렬: (96-60)*12 - 125 ≈ 307
    scrollY: 300,
  }),
  closeRegion: () => set({ openRegionId: null, selectedNoteIds: [] }),

  setScrollX: (x) => set({ scrollX: Math.max(0, x) }),
  setScrollY: (y) => set({ scrollY: Math.max(0, y) }),
  setZoom: (ppt) => set({ pixelsPerTick: Math.max(0.1, Math.min(5, ppt)) }),

  selectNote: (id, addToSelection = false) =>
    set((s) => ({
      selectedNoteIds: addToSelection
        ? s.selectedNoteIds.includes(id)
          ? s.selectedNoteIds.filter((nid) => nid !== id)
          : [...s.selectedNoteIds, id]
        : [id],
    })),

  deselectAllNotes: () => set({ selectedNoteIds: [] }),
}));
