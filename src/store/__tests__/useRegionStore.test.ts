import { describe, it, expect, beforeEach } from 'vitest';
import { useRegionStore } from '../useRegionStore';
import { DEFAULT_REGION_DURATION } from '@/types/daw';

beforeEach(() => {
  useRegionStore.setState({ regions: {}, regionCount: 0 });
});

describe('useRegionStore', () => {
  it('리전 추가', () => {
    const id = useRegionStore.getState().addRegion('track-1', 0);
    const region = useRegionStore.getState().regions[id];
    expect(region).toBeDefined();
    expect(region.trackId).toBe('track-1');
    expect(region.startTick).toBe(0);
    expect(region.durationTicks).toBe(DEFAULT_REGION_DURATION);
  });

  it('리전 삭제', () => {
    const id = useRegionStore.getState().addRegion('track-1', 0);
    useRegionStore.getState().removeRegion(id);
    expect(useRegionStore.getState().regions[id]).toBeUndefined();
  });

  it('트랙별 리전 일괄 삭제', () => {
    useRegionStore.getState().addRegion('track-1', 0);
    useRegionStore.getState().addRegion('track-1', 768);
    useRegionStore.getState().addRegion('track-2', 0);
    useRegionStore.getState().removeRegionsByTrack('track-1');
    const remaining = Object.values(useRegionStore.getState().regions);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].trackId).toBe('track-2');
  });

  it('리전 이동', () => {
    const id = useRegionStore.getState().addRegion('track-1', 0);
    useRegionStore.getState().moveRegion(id, 'track-2', 768);
    const region = useRegionStore.getState().regions[id];
    expect(region.trackId).toBe('track-2');
    expect(region.startTick).toBe(768);
  });

  it('리전 이동 시 음수 틱 방지', () => {
    const id = useRegionStore.getState().addRegion('track-1', 100);
    useRegionStore.getState().moveRegion(id, 'track-1', -50);
    expect(useRegionStore.getState().regions[id].startTick).toBe(0);
  });

  it('리전 리사이즈', () => {
    const id = useRegionStore.getState().addRegion('track-1', 0, 768);
    useRegionStore.getState().resizeRegion(id, 1536);
    expect(useRegionStore.getState().regions[id].durationTicks).toBe(1536);
  });

  it('리전 리사이즈 최소값', () => {
    const id = useRegionStore.getState().addRegion('track-1', 0, 768);
    useRegionStore.getState().resizeRegion(id, -100);
    expect(useRegionStore.getState().regions[id].durationTicks).toBe(1);
  });

  it('트랙별 리전 조회', () => {
    useRegionStore.getState().addRegion('track-1', 0);
    useRegionStore.getState().addRegion('track-1', 768);
    useRegionStore.getState().addRegion('track-2', 0);
    const regions = useRegionStore.getState().getRegionsByTrack('track-1');
    expect(regions).toHaveLength(2);
  });
});
