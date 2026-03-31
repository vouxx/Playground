'use client';

import { useCallback } from 'react';
import { DRUM_PAD_MAPPINGS, triggerDrum } from '@/engine/drumkit';
import { ensureAudioContext } from '@/engine/transport';

/**
 * 드럼 패드 UI (Presentational)
 * 키보드 입력은 useMusicalTyping hook에서 전역 처리한다.
 */
export default function DrumPadGrid() {
  const handlePadClick = useCallback(async (pitch: number) => {
    await ensureAudioContext();
    triggerDrum(pitch, undefined, 0.8);
  }, []);

  return (
    <div className="grid grid-cols-4 gap-1.5 p-3">
      {DRUM_PAD_MAPPINGS.map((pad) => (
        <button
          key={pad.padIndex}
          onMouseDown={() => handlePadClick(pad.pitch)}
          className="flex h-14 flex-col items-center justify-center rounded-lg bg-zinc-700 text-xs font-medium text-zinc-200 transition-colors hover:bg-zinc-600 active:bg-blue-600"
        >
          <span>{pad.name}</span>
          <span className="mt-0.5 text-[9px] text-zinc-500">{pad.keyTrigger.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
}
