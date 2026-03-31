'use client';

import { useEffect, useCallback } from 'react';
import { DRUM_PAD_MAPPINGS, triggerDrum } from '@/engine/drumkit';
import { useMidiStore } from '@/store/useMidiStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useProjectStore } from '@/store/useProjectStore';
import { ensureAudioContext } from '@/engine/transport';

interface DrumPadGridProps {
  activeRegionId: string | null;
}

export default function DrumPadGrid({ activeRegionId }: DrumPadGridProps) {
  const isRecording = useTransportStore((s) => s.isPlaying);
  const currentTick = useTransportStore((s) => s.currentTick);

  const handlePadTrigger = useCallback(async (pitch: number) => {
    await ensureAudioContext();
    triggerDrum(pitch, undefined, 0.8);

    // 녹음 모드(재생 중)이면 노트 기록
    if (isRecording && activeRegionId) {
      const region = Object.values(
        (await import('@/store/useRegionStore')).useRegionStore.getState().regions
      ).find((r) => r.id === activeRegionId);
      if (region) {
        const relativeTick = currentTick - region.startTick;
        if (relativeTick >= 0) {
          useMidiStore.getState().addNote(activeRegionId, pitch, relativeTick, 192, 100);
        }
      }
    }
  }, [isRecording, activeRegionId, currentTick]);

  // Keyboard triggers
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const pad = DRUM_PAD_MAPPINGS.find((p) => p.keyTrigger === e.key.toLowerCase());
      if (pad) {
        e.preventDefault();
        handlePadTrigger(pad.pitch);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handlePadTrigger]);

  return (
    <div className="grid grid-cols-4 gap-1.5 p-3">
      {DRUM_PAD_MAPPINGS.map((pad) => (
        <button
          key={pad.padIndex}
          onMouseDown={() => handlePadTrigger(pad.pitch)}
          className="flex h-14 flex-col items-center justify-center rounded-lg bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-600 active:bg-blue-600"
        >
          <span>{pad.name}</span>
          <span className="mt-0.5 text-[9px] text-zinc-500">{pad.keyTrigger.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
