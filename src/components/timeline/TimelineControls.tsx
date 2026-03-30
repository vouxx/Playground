'use client';

import { useState } from 'react';
import { useTimelineStore, MAX_BARS } from '@/store/useTimelineStore';
import { exportToWav } from '@/lib/exporter';

export default function TimelineControls() {
  const barCount = useTimelineStore((s) => s.barCount);
  const setBarCount = useTimelineStore((s) => s.setBarCount);
  const masterVolume = useTimelineStore((s) => s.masterVolume);
  const setMasterVolume = useTimelineStore((s) => s.setMasterVolume);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportToWav();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Bar Count */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Bars</label>
        <input
          type="number"
          min={1}
          max={MAX_BARS}
          value={barCount}
          onChange={(e) => setBarCount(Number(e.target.value))}
          className="w-14 rounded border border-zinc-300 bg-transparent px-2 py-1 text-center text-sm outline-none focus:border-blue-500 dark:border-zinc-600 dark:text-zinc-100"
        />
      </div>

      {/* Master Volume */}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Master</label>
        <input
          type="range"
          min={0}
          max={100}
          value={masterVolume}
          onChange={(e) => setMasterVolume(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer accent-blue-500"
          aria-label="마스터 볼륨"
        />
        <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">{masterVolume}%</span>
      </div>

      {/* Export */}
      <button
        onClick={handleExport}
        disabled={exporting}
        className="rounded-lg bg-purple-500 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {exporting ? 'Exporting...' : 'Export'}
      </button>
    </div>
  );
}
