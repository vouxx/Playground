'use client';

import { useEffect } from 'react';
import { useEffectsStore } from '@/store/useEffectsStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { buildEffectChain, disposeAllEffects } from '@/engine/effects';
import { createChannel } from '@/engine/mixer';
import * as Tone from 'tone';

/**
 * 이펙트 체인 변경 시 Tone.js 노드를 재구성
 */
export function useEffects() {
  const chains = useEffectsStore((s) => s.chains);
  const trackOrder = useProjectStore((s) => s.trackOrder);
  const tracks = useTrackStore((s) => s.tracks);

  useEffect(() => {
    for (const trackId of trackOrder) {
      const track = tracks[trackId];
      if (!track) continue;

      const chain = chains[trackId] || [];
      const channel = createChannel(trackId);

      // channel.gain → effects → channel.panner → destination
      // 이펙트가 있으면 gain과 panner 사이에 삽입
      if (chain.length > 0) {
        buildEffectChain(trackId, chain, channel.gain, channel.panner);
      }
    }

    return () => disposeAllEffects();
  }, [chains, trackOrder, tracks]);
}
