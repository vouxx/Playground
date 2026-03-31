import { describe, it, expect, beforeEach } from 'vitest';
import { useTrackStore } from '../useTrackStore';

beforeEach(() => {
  useTrackStore.setState({ tracks: {}, trackCount: 0 });
});

describe('useTrackStore', () => {
  it('트랙 추가', () => {
    const id = useTrackStore.getState().addTrack();
    const track = useTrackStore.getState().tracks[id];
    expect(track).toBeDefined();
    expect(track.name).toBe('Track 1');
    expect(track.type).toBe('midi');
    expect(track.mixer.volume).toBe(0);
  });

  it('트랙 삭제', () => {
    const id = useTrackStore.getState().addTrack();
    useTrackStore.getState().removeTrack(id);
    expect(useTrackStore.getState().tracks[id]).toBeUndefined();
  });

  it('트랙 복제', () => {
    const id = useTrackStore.getState().addTrack();
    const dupId = useTrackStore.getState().duplicateTrack(id);
    expect(dupId).not.toBeNull();
    const dup = useTrackStore.getState().tracks[dupId!];
    expect(dup.name).toBe('Track 1 (Copy)');
  });

  it('볼륨 설정 및 클램핑', () => {
    const id = useTrackStore.getState().addTrack();
    useTrackStore.getState().setVolume(id, -12);
    expect(useTrackStore.getState().tracks[id].mixer.volume).toBe(-12);

    useTrackStore.getState().setVolume(id, 100);
    expect(useTrackStore.getState().tracks[id].mixer.volume).toBe(6);
  });

  it('팬 설정 및 클램핑', () => {
    const id = useTrackStore.getState().addTrack();
    useTrackStore.getState().setPan(id, 0.5);
    expect(useTrackStore.getState().tracks[id].mixer.pan).toBe(0.5);

    useTrackStore.getState().setPan(id, 5);
    expect(useTrackStore.getState().tracks[id].mixer.pan).toBe(1);
  });

  it('뮤트 토글', () => {
    const id = useTrackStore.getState().addTrack();
    expect(useTrackStore.getState().tracks[id].mixer.mute).toBe(false);
    useTrackStore.getState().toggleMute(id);
    expect(useTrackStore.getState().tracks[id].mixer.mute).toBe(true);
    useTrackStore.getState().toggleMute(id);
    expect(useTrackStore.getState().tracks[id].mixer.mute).toBe(false);
  });

  it('솔로 토글', () => {
    const id = useTrackStore.getState().addTrack();
    useTrackStore.getState().toggleSolo(id);
    expect(useTrackStore.getState().tracks[id].mixer.solo).toBe(true);
  });
});
