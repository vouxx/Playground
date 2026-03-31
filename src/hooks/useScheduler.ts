'use client';

import { useEffect } from 'react';
import { useTransportStore } from '@/store/useTransportStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useAudioStore } from '@/store/useAudioStore';
import { scheduleAllNotes, clearSchedule } from '@/engine/scheduler';
import { scheduleAudioRegion, clearAudioSchedule } from '@/engine/audioPlayer';
import { getSynth } from '@/engine/instruments';
import { createChannel } from '@/engine/mixer';
import { initDrumKit } from '@/engine/drumkit';
import { tickToSeconds } from '@/lib/units';

/**
 * Transport 재생/정지 시 MIDI + 오디오 스케줄링을 관리하는 훅
 */
export function useScheduler() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const bpm = useProjectStore((s) => s.bpm);
  const trackOrder = useProjectStore((s) => s.trackOrder);
  const tracks = useTrackStore((s) => s.tracks);
  const regions = useRegionStore((s) => s.regions);
  const notes = useMidiStore((s) => s.notes);
  const audioRegions = useAudioStore((s) => s.audioRegions);
  const buffers = useAudioStore((s) => s.buffers);

  useEffect(() => {
    if (!isPlaying) {
      clearSchedule();
      clearAudioSchedule();
      return;
    }

    // MIDI 스케줄링
    const trackData = trackOrder.map((trackId) => {
      const track = tracks[trackId];
      if (!track || track.type === 'audio') return null;

      const trackRegions = Object.values(regions).filter((r) => r.trackId === trackId);
      const trackNotes = Object.values(notes);
      const channel = createChannel(trackId);

      let synth = null;
      if (track.type === 'drum') {
        initDrumKit(channel.gain);
      } else {
        synth = getSynth(trackId, track.instrumentId);
        synth.disconnect();
        synth.connect(channel.gain);
      }

      return {
        trackId,
        instrumentId: track.instrumentId,
        type: track.type as 'midi' | 'drum',
        regions: trackRegions,
        notes: trackNotes,
        synth,
      };
    }).filter(Boolean) as Parameters<typeof scheduleAllNotes>[0];

    scheduleAllNotes(trackData, bpm);

    // 오디오 스케줄링
    for (const regionId of Object.keys(audioRegions)) {
      const data = audioRegions[regionId];
      const region = regions[regionId];
      if (!data || !region) continue;

      const buffer = buffers[data.bufferId];
      if (!buffer) continue;

      const channel = createChannel(region.trackId);
      const startSeconds = tickToSeconds(region.startTick, bpm);
      scheduleAudioRegion(regionId, buffer, data, startSeconds, channel.gain);
    }

    return () => {
      clearSchedule();
      clearAudioSchedule();
    };
  }, [isPlaying, bpm, trackOrder, tracks, regions, notes, audioRegions, buffers]);
}
