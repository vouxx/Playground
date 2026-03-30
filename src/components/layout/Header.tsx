'use client';

import { useSequencerStore } from '@/store/useSequencerStore';

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
  const clearPattern = useSequencerStore((s) => s.clearPattern);

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
          Playground - Beat me Up!
        </h1>

        <button
          onClick={isPlaying ? onStop : onPlay}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium text-white transition-colors ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isPlaying ? '■ Stop' : '▶ Play'}
        </button>

        <RecButton />
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="bpm" className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
            BPM
          </label>
          <input
            id="bpm"
            type="number"
            min={60}
            max={200}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
            className="w-16 rounded border border-zinc-300 bg-transparent px-2 py-1 text-center text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-600 dark:text-zinc-100"
          />
        </div>

        <button
          onClick={clearPattern}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Clear
        </button>

        <button
          onClick={onToggleTheme}
          className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-800"
          aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
}
