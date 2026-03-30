'use client';

import { useEffectsStore } from '@/store/useEffectsStore';

const KNOBS = [
  { key: 'reverb' as const, label: 'Reverb', set: 'setReverb' as const },
  { key: 'delay' as const, label: 'Delay', set: 'setDelay' as const },
  { key: 'distortion' as const, label: 'Distort', set: 'setDistortion' as const },
  { key: 'filter' as const, label: 'Filter', set: 'setFilter' as const },
];

export default function EffectsPanel() {
  const store = useEffectsStore();

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">FX</span>
      {KNOBS.map(({ key, label, set }) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <input
            type="range"
            min={0}
            max={100}
            value={store[key]}
            onChange={(e) => store[set](Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-purple-500"
            aria-label={label}
          />
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            {label} {store[key]}%
          </span>
        </div>
      ))}
    </div>
  );
}
