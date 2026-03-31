'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useTransportStore } from '@/store/useTransportStore';
import { useProjectStore } from '@/store/useProjectStore';
import * as transport from '@/engine/transport';
import { startMetronome, stopMetronome, setMetronomeEnabled } from '@/engine/metronome';

/**
 * Transport 엔진과 스토어를 연결하는 훅
 * rAF 루프로 재생 위치를 동기화한다.
 */
export function useTransport() {
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const isMetronomeOn = useTransportStore((s) => s.isMetronomeOn);
  const bpm = useProjectStore((s) => s.bpm);
  const beatsPerBar = useProjectStore((s) => s.timeSignature[0]);
  const rafRef = useRef<number | null>(null);

  // BPM 동기화
  useEffect(() => {
    transport.setBpm(bpm);
  }, [bpm]);

  // 메트로놈 on/off
  useEffect(() => {
    setMetronomeEnabled(isMetronomeOn);
  }, [isMetronomeOn]);

  // 재생/정지 동기화 + rAF 위치 업데이트
  useEffect(() => {
    if (isPlaying) {
      startMetronome(beatsPerBar);
      transport.play();

      const tick = (): void => {
        const currentTick = transport.getCurrentTick(bpm);
        useTransportStore.getState().updateCurrentTick(currentTick);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } else {
      transport.stop();
      stopMetronome();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, bpm, beatsPerBar]);

  const handlePlay = useCallback(async () => {
    await transport.ensureAudioContext();
    useTransportStore.getState().play();
  }, []);

  const handleStop = useCallback(() => {
    useTransportStore.getState().stop();
    // 두 번째 stop 시 엔진 위치도 0으로
    if (!useTransportStore.getState().wasPaused) {
      transport.goToStart();
    }
  }, []);

  const handleTogglePlayStop = useCallback(async () => {
    if (useTransportStore.getState().isPlaying) {
      handleStop();
    } else {
      await handlePlay();
    }
  }, [handlePlay, handleStop]);

  return { handlePlay, handleStop, handleTogglePlayStop };
}
