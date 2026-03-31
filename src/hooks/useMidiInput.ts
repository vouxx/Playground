'use client';

import { useEffect, useState } from 'react';
import { initMidiInput, disposeMidiInput, getConnectedDevices } from '@/engine/midiInput';
import { useTrackStore } from '@/store/useTrackStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useRegionStore } from '@/store/useRegionStore';
import { getSynth } from '@/engine/instruments';
import { triggerDrum } from '@/engine/drumkit';
import { createChannel } from '@/engine/mixer';
import { pitchToName, velocityToGain } from '@/lib/midi';

/**
 * Web MIDI 컨트롤러 연결 및 실시간 입력 처리
 */
export function useMidiInput() {
  const [devices, setDevices] = useState<string[]>([]);

  useEffect(() => {
    const handleNote = (pitch: number, velocity: number, isNoteOn: boolean) => {
      // 첫 번째 트랙을 대상으로 (추후 선택된 트랙으로 변경 가능)
      const trackOrder = useProjectStore.getState().trackOrder;
      if (trackOrder.length === 0) return;

      const trackId = trackOrder[0];
      const track = useTrackStore.getState().tracks[trackId];
      if (!track) return;

      if (isNoteOn) {
        if (track.type === 'drum') {
          triggerDrum(pitch, undefined, velocityToGain(velocity));
        } else {
          const channel = createChannel(trackId);
          const synth = getSynth(trackId, track.instrumentId);
          synth.disconnect();
          synth.connect(channel.gain);
          const noteName = pitchToName(pitch);
          if ('triggerAttack' in synth) {
            (synth as any).triggerAttack(noteName, undefined, velocityToGain(velocity));
          }
        }

        // 녹음 모드이면 노트 기록
        const { isPlaying, currentTick } = useTransportStore.getState();
        if (isPlaying) {
          const regions = Object.values(useRegionStore.getState().regions)
            .filter((r) => r.trackId === trackId);
          const activeRegion = regions.find(
            (r) => currentTick >= r.startTick && currentTick < r.startTick + r.durationTicks,
          );
          if (activeRegion) {
            const relativeTick = currentTick - activeRegion.startTick;
            useMidiStore.getState().addNote(activeRegion.id, pitch, relativeTick, 192, velocity);
          }
        }
      } else {
        // Note off
        const track2 = useTrackStore.getState().tracks[trackId];
        if (track2 && track2.type !== 'drum') {
          const synth = getSynth(trackId, track2.instrumentId);
          if ('triggerRelease' in synth) {
            (synth as any).triggerRelease(pitchToName(pitch));
          }
        }
      }
    };

    initMidiInput(handleNote).then((devs) => setDevices(devs));

    const interval = setInterval(() => {
      setDevices(getConnectedDevices());
    }, 3000);

    return () => {
      clearInterval(interval);
      disposeMidiInput();
    };
  }, []);

  return { devices };
}
