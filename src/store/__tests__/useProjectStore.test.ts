import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from '../useProjectStore';

beforeEach(() => {
  useProjectStore.setState({
    bpm: 120,
    timeSignature: [4, 4],
    trackOrder: [],
    name: 'Untitled Project',
  });
});

describe('useProjectStore', () => {
  it('BPM 변경', () => {
    useProjectStore.getState().setBpm(140);
    expect(useProjectStore.getState().bpm).toBe(140);
  });

  it('BPM 최소/최대 제한', () => {
    useProjectStore.getState().setBpm(5);
    expect(useProjectStore.getState().bpm).toBe(20);
    useProjectStore.getState().setBpm(1500);
    expect(useProjectStore.getState().bpm).toBe(999);
  });

  it('박자표 변경', () => {
    useProjectStore.getState().setTimeSignature([3, 4]);
    expect(useProjectStore.getState().timeSignature).toEqual([3, 4]);
  });

  it('트랙 순서 추가/제거', () => {
    useProjectStore.getState().addTrackToOrder('a');
    useProjectStore.getState().addTrackToOrder('b');
    expect(useProjectStore.getState().trackOrder).toEqual(['a', 'b']);

    useProjectStore.getState().removeTrackFromOrder('a');
    expect(useProjectStore.getState().trackOrder).toEqual(['b']);
  });

  it('트랙 순서 변경', () => {
    useProjectStore.setState({ trackOrder: ['a', 'b', 'c'] });
    useProjectStore.getState().reorderTracks(0, 2);
    expect(useProjectStore.getState().trackOrder).toEqual(['b', 'c', 'a']);
  });
});
