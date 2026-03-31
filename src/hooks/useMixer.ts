'use client';

import { useEffect } from 'react';
import { useTrackStore } from '@/store/useTrackStore';
import { useProjectStore } from '@/store/useProjectStore';
import * as mixer from '@/engine/mixer';

/**
 * TrackStore의 믹서 상태를 오디오 엔진의 Gain/Panner 노드에 실시간 반영
 */
export function useMixer() {
  const tracks = useTrackStore((s) => s.tracks);
  const trackOrder = useProjectStore((s) => s.trackOrder);

  useEffect(() => {
    // 트랙 추가 시 채널 생성
    for (const id of trackOrder) {
      mixer.createChannel(id);
    }

    // 솔로/뮤트/볼륨/팬 일괄 적용
    const trackStates = trackOrder
      .map((id) => tracks[id])
      .filter(Boolean)
      .map((t) => ({
        id: t.id,
        volume: t.mixer.volume,
        mute: t.mixer.mute,
        solo: t.mixer.solo,
      }));

    mixer.applySoloState(trackStates);

    // 팬 개별 적용
    for (const t of trackStates) {
      const track = tracks[t.id];
      if (track) mixer.setChannelPan(t.id, track.mixer.pan);
    }
  }, [tracks, trackOrder]);

  // 트랙 삭제 시 채널 제거
  useEffect(() => {
    return () => {
      mixer.disposeAllChannels();
    };
  }, []);
}
