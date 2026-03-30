'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useSequencerStore } from '@/store/useSequencerStore';
import { initAudio, triggerDrum, setTrackVolume, setTrackMute, getTransport } from '@/lib/audio';
import { initSynth, triggerNotes, setSynthVolume, setSynthMute, setSynthPreset } from '@/lib/synth';
import { usePianoStore } from '@/store/usePianoStore';
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

  const startSequencer = useCallback(async () => {
    if (!audioReady.current) {
      await initAudio();
      initSynth();
      audioReady.current = true;
    }

    syncVolumes();
    syncPiano();

    const transport = getTransport();
    const { bpm } = useSequencerStore.getState();
    transport.bpm.value = bpm;

    if (sequenceRef.current !== null) {
      transport.clear(sequenceRef.current);
    }

    let step = 0;
    sequenceRef.current = transport.scheduleRepeat((time) => {
      const { tracks } = useSequencerStore.getState();
      const hasSolo = tracks.some((t) => t.solo);

      tracks.forEach((track) => {
        if (!track.steps[step]) return;
        if (!isTrackAudible(track.mute, track.solo, hasSolo)) return;
        triggerDrum(track.id as DrumType, time);
      });

      // Piano roll notes
      const pianoState = usePianoStore.getState();
      if (!pianoState.mute) {
        const notes = pianoState.getActiveNotes(step);
        if (notes.length > 0) triggerNotes(notes, time);
      }

      useSequencerStore.getState().setCurrentStep(step);
      step = (step + 1) % STEP_COUNT;
    }, '16n');

    transport.start();
    useSequencerStore.getState().setPlaying(true);
  }, [syncVolumes]);

  const stopSequencer = useCallback(() => {
    const transport = getTransport();

    if (sequenceRef.current !== null) {
      transport.clear(sequenceRef.current);
      sequenceRef.current = null;
    }

    transport.stop();
    transport.position = 0;
    useSequencerStore.getState().setPlaying(false);
  }, []);

  // BPM 동기화
  useEffect(() => {
    const unsub = useSequencerStore.subscribe((state, prev) => {
      if (state.bpm !== prev.bpm) {
        getTransport().bpm.value = state.bpm;
      }
    });
    return unsub;
  }, []);

  // 볼륨/뮤트/솔로 동기화
  useEffect(() => {
    const unsub = useSequencerStore.subscribe((state, prev) => {
      if (state.tracks !== prev.tracks) {
        syncVolumes();
      }
    });
    return unsub;
  }, [syncVolumes]);

  // 피아노 볼륨/뮤트/프리셋 동기화
  useEffect(() => {
    const unsub = usePianoStore.subscribe((state, prev) => {
      if (state.volume !== prev.volume || state.mute !== prev.mute || state.preset !== prev.preset) {
        syncPiano();
      }
    });
    return unsub;
  }, [syncPiano]);

  // 정리
  useEffect(() => {
    return () => {
      const transport = getTransport();
      if (sequenceRef.current !== null) {
        transport.clear(sequenceRef.current);
      }
      transport.stop();
    };
  }, []);

  return { startSequencer, stopSequencer };
}
