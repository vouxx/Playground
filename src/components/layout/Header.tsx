'use client';

import { useSequencerStore } from '@/store/useSequencerStore';
import { useTapTempo } from '@/hooks/useTapTempo';
import { BEAT_PRESETS } from '@/lib/presets';

function RecButton() {
  const isRecording = useSequencerStore((s) => s.isRecording);
  const setRecording = useSequencerStore((s) => s.setRecording);

  return (
    <button
      onClick={() => setRecording(!isRecording)}
      className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-colors ${
        isRecording
          ? 'animate-pulse bg-red-600 text-white'
          : 'border border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800'
      }`}
      aria-label={isRecording ? '녹음 중지' : '녹음 시작'}
    >
      {isRecording ? '● REC' : '○ REC'}
    </button>
  );
}

interface HeaderProps {
  theme: 'light' | 'dark';
  isPlaying: boolean;
  onToggleTheme: () => void;
  onPlay: () => void;
  onStop: () => void;
}

export default function Header({ theme, isPlaying, onToggleTheme, onPlay, onStop }: HeaderProps) {
  const bpm = useSequencerStore((s) => s.bpm);
  const setBpm = useSequencerStore((s) => s.setBpm);
  const swing = useSequencerStore((s) => s.swing);
  const setSwing = useSequencerStore((s) => s.setSwing);
  const clearPattern = useSequencerStore((s) => s.clearPattern);
  const loadPreset = useSequencerStore((s) => s.loadPreset);
  const undo = useSequencerStore((s) => s.undo);
  const redo = useSequencerStore((s) => s.redo);
  const { tap } = useTapTempo();

  return (
    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-700 dark:bg-zinc-900">
      {/* Left: Title + Transport */}
      <div className="flex items-center gap-3">
        <h1 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
          Beat me Up!
        </h1>

        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors ${
            isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>

        <RecButton />

        <div className="flex items-center gap-1">
          <button onClick={undo} className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Undo">↩</button>
          <button onClick={redo} className="rounded px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Redo">↪</button>
        </div>
      </div>

      {/* Center: BPM + Swing + Tap + Presets */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <label htmlFor="bpm" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">BPM</label>
          <input
            id="bpm"
            type="number"
            min={60}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-14 rounded border border-zinc-300 bg-transparent px-1.5 py-1 text-center text-sm outline-none focus:border-blue-500 dark:border-zinc-600 dark:text-zinc-100"
          />
          <button
            onClick={tap}
            className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          >
            TAP
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Swing</label>
          <input
            type="range"
            min={0}
            max={100}
            value={swing}
            onChange={(e) => setSwing(Number(e.target.value))}
            className="h-1 w-16 cursor-pointer accent-blue-500"
            aria-label="스윙"
          />
          <span className="w-6 text-xs text-zinc-400">{swing}%</span>
        </div>

        <div className="flex items-center gap-1">
          {BEAT_PRESETS.map((p) => (
            <button
              key={p.name}
              onClick={() => loadPreset(p)}
              className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-blue-100 hover:text-blue-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-blue-900 dark:hover:text-blue-300"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Clear + Theme */}
      <div className="flex items-center gap-2">
        <button
          onClick={clearPattern}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Clear
        </button>
        <button
          onClick={onToggleTheme}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          aria-label={theme === 'dark' ? '라이트 모드' : '다크 모드'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
