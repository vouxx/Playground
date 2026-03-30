'use client';

import { useTimelineStore } from '@/store/useTimelineStore';

export default function TimelineGrid() {
  const bars = useTimelineStore((s) => s.bars);
  const barCount = useTimelineStore((s) => s.barCount);
  const currentBar = useTimelineStore((s) => s.currentBar);
  const toggleDrum = useTimelineStore((s) => s.toggleDrum);
  const togglePiano = useTimelineStore((s) => s.togglePiano);

  const visibleBars = bars.slice(0, barCount);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-20 px-2 py-1 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
              Track
            </th>
            {visibleBars.map((_, i) => (
              <th
                key={i}
                className={`px-1 py-1 text-center text-xs font-medium ${
                  currentBar === i
                    ? 'text-yellow-500'
                    : 'text-zinc-500 dark:text-zinc-400'
                }`}
              >
                Bar {i + 1}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Drums
            </td>
            {visibleBars.map((bar, i) => (
              <td key={i} className="px-1 py-1 text-center">
                <button
                  onClick={() => toggleDrum(i)}
                  className={`h-10 w-full rounded-md transition-colors ${
                    currentBar === i ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    bar.drumEnabled
                      ? 'bg-blue-500 hover:bg-blue-400'
                      : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  }`}
                  aria-label={`Bar ${i + 1} drums ${bar.drumEnabled ? '비활성화' : '활성화'}`}
                />
              </td>
            ))}
          </tr>
          <tr>
            <td className="px-2 py-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Melody
            </td>
            {visibleBars.map((bar, i) => (
              <td key={i} className="px-1 py-1 text-center">
                <button
                  onClick={() => togglePiano(i)}
                  className={`h-10 w-full rounded-md transition-colors ${
                    currentBar === i ? 'ring-2 ring-yellow-400' : ''
                  } ${
                    bar.pianoEnabled
                      ? 'bg-emerald-500 hover:bg-emerald-400'
                      : 'bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600'
                  }`}
                  aria-label={`Bar ${i + 1} melody ${bar.pianoEnabled ? '비활성화' : '활성화'}`}
                />
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
