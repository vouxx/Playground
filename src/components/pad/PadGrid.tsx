'use client';

import DrumPad from './DrumPad';
import { usePad } from '@/hooks/usePad';
import { DRUM_KIT } from '@/types';

const SHORTCUTS = ['q', 'w', 'e', 'r', 'a', 's', 'd', 'f'];

export default function PadGrid() {
  const { triggerPad } = usePad();

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="grid grid-cols-4 gap-3">
        {DRUM_KIT.map((drum, i) => (
          <DrumPad
            key={drum.id}
            drum={drum.id}
            name={drum.name}
            shortcut={SHORTCUTS[i]}
            onTrigger={triggerPad}
          />
        ))}
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
        키보드 Q, W, E, R, A, S, D, F 로 연주할 수 있습니다
      </p>
    </section>
  );
}
