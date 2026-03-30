'use client';

import { usePianoStore } from '@/store/usePianoStore';
import { CHORD_PRESETS, PIANO_NOTES, STEP_COUNT } from '@/types';
import type { PianoNote, SynthPreset } from '@/types';
import { useSequencerStore } from '@/store/useSequencerStore';

const PRESETS: { key: SynthPreset; label: string }[] = [
  { key: 'sine', label: 'Sine' },
  { key: 'square', label: 'Square' },
  { key: 'triangle', label: 'Triangle' },
  { key: 'sawtooth', label: 'Saw' },
];

export default function PianoControls() {
  const preset = usePianoStore((s) => s.preset);
  const setPreset = usePianoStore((s) => s.setPreset);
  const volume = usePianoStore((s) => s.volume);
  const setVolume = usePianoStore((s) => s.setVolume);
  const mute = usePianoStore((s) => s.mute);
  const toggleMute = usePianoStore((s) => s.toggleMute);
  const clearGrid = usePianoStore((s) => s.clearGrid);
  const setNoteOn = usePianoStore((s) => s.setNoteOn);
  const currentStep = useSequencerStore((s) => s.currentStep);

  const applyChord = (notes: PianoNote[]) => {
    const step = currentStep >= 0 ? currentStep : 0;
    notes.forEach((note) => {
      if (PIANO_NOTES.includes(note)) {
        setNoteOn(note, step);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      {/* Synth Preset */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Synth</span>
        {PRESETS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
              preset === key
                ? 'bg-emerald-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Volume + Mute */}
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="h-1 w-20 cursor-pointer accent-emerald-500"
          aria-label="신스 볼륨"
        />
        <button
          onClick={toggleMute}
          className={`h-6 w-6 rounded text-xs font-bold transition-colors ${
            mute
              ? 'bg-red-500 text-white'
              : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400'
          }`}
          aria-label={mute ? '뮤트 해제' : '뮤트'}
        >
          M
        </button>
      </div>

      {/* Chord Presets */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Chord</span>
        {CHORD_PRESETS.map((chord) => (
          <button
            key={chord.name}
            onClick={() => applyChord(chord.notes)}
            className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 transition-colors hover:bg-emerald-100 hover:text-emerald-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-emerald-900 dark:hover:text-emerald-300"
          >
            {chord.name}
          </button>
        ))}
      </div>

      {/* Clear */}
      <button
        onClick={clearGrid}
        className="rounded border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        Clear Notes
      </button>
    </div>
  );
}
