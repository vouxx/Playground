import { create } from 'zustand';
import type { AudioRegionData } from '@/types/daw';

interface AudioStore {
  /** AudioBuffer 저장소 (bufferId → AudioBuffer) */
  buffers: Record<string, AudioBuffer>;
  /** 리전별 오디오 메타데이터 (regionId → AudioRegionData) */
  audioRegions: Record<string, AudioRegionData>;
  /** 트랙별 녹음 대기 상태 */
  armedTracks: Set<string>;

  addBuffer: (id: string, buffer: AudioBuffer) => void;
  removeBuffer: (id: string) => void;
  setAudioRegion: (regionId: string, data: AudioRegionData) => void;
  removeAudioRegion: (regionId: string) => void;
  updateAudioRegion: (regionId: string, updates: Partial<AudioRegionData>) => void;
  toggleArm: (trackId: string) => void;
  isArmed: (trackId: string) => boolean;

  /** Split: 리전을 둘로 나눌 때 오디오 메타도 분리 */
  splitAudioRegion: (
    sourceRegionId: string,
    newRegionId: string,
    splitOffsetSeconds: number,
  ) => void;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  buffers: {},
  audioRegions: {},
  armedTracks: new Set(),

  addBuffer: (id, buffer) =>
    set((s) => ({ buffers: { ...s.buffers, [id]: buffer } })),

  removeBuffer: (id) =>
    set((s) => {
      const { [id]: _, ...rest } = s.buffers;
      return { buffers: rest };
    }),

  setAudioRegion: (regionId, data) =>
    set((s) => ({ audioRegions: { ...s.audioRegions, [regionId]: data } })),

  removeAudioRegion: (regionId) =>
    set((s) => {
      const { [regionId]: _, ...rest } = s.audioRegions;
      return { audioRegions: rest };
    }),

  updateAudioRegion: (regionId, updates) =>
    set((s) => {
      const existing = s.audioRegions[regionId];
      if (!existing) return s;
      return {
        audioRegions: { ...s.audioRegions, [regionId]: { ...existing, ...updates } },
      };
    }),

  toggleArm: (trackId) =>
    set((s) => {
      const next = new Set(s.armedTracks);
      if (next.has(trackId)) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return { armedTracks: next };
    }),

  isArmed: (trackId) => get().armedTracks.has(trackId),

  splitAudioRegion: (sourceRegionId, newRegionId, splitOffsetSeconds) =>
    set((s) => {
      const source = s.audioRegions[sourceRegionId];
      if (!source) return s;

      const firstDuration = splitOffsetSeconds;
      const secondOffset = source.offset + splitOffsetSeconds;
      const secondDuration = source.playDuration - splitOffsetSeconds;

      return {
        audioRegions: {
          ...s.audioRegions,
          [sourceRegionId]: { ...source, playDuration: firstDuration },
          [newRegionId]: {
            bufferId: source.bufferId,
            offset: secondOffset,
            playDuration: secondDuration,
            fadeInDuration: 0,
            fadeOutDuration: source.fadeOutDuration,
          },
        },
      };
    }),
}));
