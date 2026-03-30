'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSequencerStore } from '@/store/useSequencerStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { initAudio, triggerDrum, setTrackVolume, setTrackMute, getTransport } from '@/lib/audio';
import { initSynth, triggerNotes, setSynthVolume, setSynthMute, setSynthPreset } from '@/lib/synth';
import { initEffects, updateEffects } from '@/lib/effects';
import { usePianoStore } from '@/store/usePianoStore';
import { useEffectsStore } from '@/store/useEffectsStore';
import * as Tone from 'tone';
import type { DrumType } from '@/types';
import { STEP_COUNT } from '@/types';

function volumeToDb(volume: number): number {
  if (volume <= 0) return -Infinity;
  return (volume / 100) * 40 - 30;
}

function isTrackAudible(
  trackMute: boolean,
  trackSolo: boolean,
  hasSoloedTrack: boolean,
): boolean {
  if (hasSoloedTrack) return trackSolo;
  return !trackMute;
}

export function useSequencer() {
  const sequenceRef = useRef<number | null>(null);
  const audioReady = useRef(false);

  const syncVolumes = useCallback(() => {
    const { tracks } = useSequencerStore.getState();
    const hasSolo = tracks.some((t) => t.solo);

    tracks.forEach((track) => {
      setTrackVolume(track.id, volumeToDb(track.volume));
      const audible = isTrackAudible(track.mute, track.solo, hasSolo);
      setTrackMute(track.id, !audible);
    });
  }, []);

  const syncPiano = useCallback(() => {
    const { volume, mute, preset } = usePianoStore.getState();
    setSynthVolume(volumeToDb(volume));
    setSynthMute(mute);
    setSynthPreset(preset);
  }, []);

  const syncMaster = useCallback(() => {
    const { masterVolume } = useTimelineStore.getState();
    Tone.getDestination().volume.value = volumeToDb(masterVolume);
  }, []);

  const startSequencer = useCallback(async () => {
    if (!audioReady.current) {
      await initAudio();
      initSynth();
      initEffects();
      audioReady.current = true;
    }
    updateEffects(useEffectsStore.getState());

    syncVolumes();
    syncPiano();
    syncMaster();

    const transport = getTransport();
    const { bpm } = useSequencerStore.getState();
    transport.bpm.value = bpm;

    if (sequenceRef.current !== null) {
      transport.clear(sequenceRef.current);
    }

    let globalStep = 0;
    sequenceRef.current = transport.scheduleRepeat((time) => {
      const { isTimelineMode } = useTimelineStore.getState();
      const { bars, barCount } = useTimelineStore.getState();
      const { tracks } = useSequencerStore.getState();
      const hasSolo = tracks.some((t) => t.solo);

      let step: number;
      let barIndex: number;

      if (isTimelineMode) {
        barIndex = Math.floor(globalStep / STEP_COUNT) % barCount;
        step = globalStep % STEP_COUNT;
        useTimelineStore.getState().setCurrentBar(barIndex);
      } else {
        barIndex = 0;
        step = globalStep % STEP_COUNT;
      }

      const bar = bars[barIndex];
      const drumsActive = isTimelineMode ? bar.drumEnabled : true;
      const pianoActive = isTimelineMode ? bar.pianoEnabled : true;

      // Drums
      if (drumsActive) {
        tracks.forEach((track) => {
          if (!track.steps[step]) return;
          if (!isTrackAudible(track.mute, track.solo, hasSolo)) return;
          triggerDrum(track.id as DrumType, time);
        });
      }

      // Piano
      const pianoState = usePianoStore.getState();
      if (pianoActive && !pianoState.mute) {
        const notes = pianoState.getActiveNotes(step);
        if (notes.length > 0) triggerNotes(notes, time);
      }

      useSequencerStore.getState().setCurrentStep(step);

      if (isTimelineMode) {
        globalStep = (globalStep + 1) % (STEP_COUNT * barCount);
      } else {
        globalStep = (globalStep + 1) % STEP_COUNT;
      }
    }, '16n');

    transport.start();
    useSequencerStore.getState().setPlaying(true);
  }, [syncVolumes, syncPiano, syncMaster]);

  const stopSequencer = useCallback(() => {
    const transport = getTransport();

    if (sequenceRef.current !== null) {
      transport.clear(sequenceRef.current);
      sequenceRef.current = null;
    }

    transport.stop();
    transport.position = 0;
    useSequencerStore.getState().setPlaying(false);
    useTimelineStore.getState().setCurrentBar(0);
  }, []);

  // BPM + 스윙 동기화
  useEffect(() => {
    const unsub = useSequencerStore.subscribe((state, prev) => {
      const transport = getTransport();
      if (state.bpm !== prev.bpm) transport.bpm.value = state.bpm;
      if (state.swing !== prev.swing) transport.swing = state.swing / 100;
    });
    return unsub;
  }, []);

  // 볼륨/뮤트/솔로 동기화
  useEffect(() => {
    const unsub = useSequencerStore.subscribe((state, prev) => {
      if (state.tracks !== prev.tracks) syncVolumes();
    });
    return unsub;
  }, [syncVolumes]);

  // 피아노 동기화
  useEffect(() => {
    const unsub = usePianoStore.subscribe((state, prev) => {
      if (state.volume !== prev.volume || state.mute !== prev.mute || state.preset !== prev.preset) {
        syncPiano();
      }
    });
    return unsub;
  }, [syncPiano]);

  // 마스터 볼륨 동기화
  useEffect(() => {
    const unsub = useTimelineStore.subscribe((state, prev) => {
      if (state.masterVolume !== prev.masterVolume) syncMaster();
    });
    return unsub;
  }, [syncMaster]);

  // 이펙트 동기화
  useEffect(() => {
    const unsub = useEffectsStore.subscribe(() => {
      updateEffects(useEffectsStore.getState());
    });
    return unsub;
  }, []);

  // 정리
  useEffect(() => {
    return () => {
      const transport = getTransport();
      if (sequenceRef.current !== null) transport.clear(sequenceRef.current);
      transport.stop();
    };
  }, []);

  return { startSequencer, stopSequencer };
}
