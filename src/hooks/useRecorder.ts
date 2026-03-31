'use client';

import { useEffect, useRef } from 'react';
import { useTransportStore } from '@/store/useTransportStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useAudioStore } from '@/store/useAudioStore';
import { startRecording, stopRecording } from '@/engine/recorder';
import { tickToSeconds, secondsToTick } from '@/lib/units';
import { PPQ } from '@/types/daw';

/**
 * 녹음 대기 트랙이 있을 때 Transport 재생/정지에 맞춰 녹음을 관리
 */
export function useRecorder() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const recordingRef = useRef(false);

  useEffect(() => {
    const armedTracks = useAudioStore.getState().armedTracks;
    if (armedTracks.size === 0) return;

    if (isPlaying && !recordingRef.current) {
      recordingRef.current = true;
      const bpm = useProjectStore.getState().bpm;
      const startTick = useTransportStore.getState().currentTick;

      // 각 armed 트랙에 대해 녹음 시작
      for (const trackId of armedTracks) {
        const track = useTrackStore.getState().tracks[trackId];
        if (!track || track.type !== 'audio') continue;

        startRecording().then((audioBuffer) => {
          const bufferId = crypto.randomUUID();
          useAudioStore.getState().addBuffer(bufferId, audioBuffer);

          const durationSeconds = audioBuffer.duration;
          const durationTicks = secondsToTick(durationSeconds, bpm);
          const regionId = useRegionStore.getState().addRegion(
            trackId,
            startTick,
            Math.max(PPQ, durationTicks),
          );

          useAudioStore.getState().setAudioRegion(regionId, {
            bufferId,
            offset: 0,
            playDuration: durationSeconds,
            fadeInDuration: 0,
            fadeOutDuration: 0,
          });
        });
      }
    } else if (!isPlaying && recordingRef.current) {
      recordingRef.current = false;
      stopRecording();
    }
  }, [isPlaying]);
}
