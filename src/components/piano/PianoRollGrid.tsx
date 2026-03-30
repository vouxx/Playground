'use client';

import { usePianoStore } from '@/store/usePianoStore';
import { useSequencerStore } from '@/store/useSequencerStore';
import { PIANO_NOTES, STEP_COUNT } from '@/types';
import type { PianoNote } from '@/types';

function isBlackKey(note: string): boolean {
  return note.includes('#');
}

export default function PianoRollGrid() {
  const grid = usePianoStore((s) => s.grid);
  const toggleNote = usePianoStore((s) => s.toggleNote);
  const currentStep = useSequencerStore((s) => s.currentStep);

  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col">
        {PIANO_NOTES.map((note) => (
          <div key={note} className="flex items-center">
            <span
              className={`w-14 shrink-0 border-r px-2 py-1 text-right text-xs font-mono ${
                isBlackKey(note)
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700'
              }`}
            >
              {note}
            </span>
            <div className="flex">
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <NoteCell
                  key={i}
                  active={grid[note][i]}
                  isCurrentStep={currentStep === i}
                  stepIndex={i}
                  isBlack={isBlackKey(note)}
                  onClick={() => toggleNote(note as PianoNote, i)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NoteCell({
  active,
  isCurrentStep,
  stepIndex,
  isBlack,
  onClick,
}: {
  active: boolean;
  isCurrentStep: boolean;
  stepIndex: number;
  isBlack: boolean;
  onClick: () => void;
}) {
  const isGroupStart = stepIndex % 4 === 0;

  return (
    <button
      onClick={onClick}
      className={`h-6 w-8 border-b border-r transition-colors ${
        isGroupStart ? 'border-l border-l-zinc-300 dark:border-l-zinc-600' : ''
      } ${
        active
          ? isCurrentStep
            ? 'bg-yellow-400 border-yellow-500'
            : 'bg-emerald-500 border-emerald-600'
          : isCurrentStep
            ? isBlack
              ? 'bg-zinc-600 border-zinc-500'
              : 'bg-zinc-200 border-zinc-300 dark:bg-zinc-700 dark:border-zinc-600'
            : isBlack
              ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-700'
              : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 dark:bg-zinc-850 dark:border-zinc-700 dark:hover:bg-zinc-800'
      }`}
      aria-label={`노트 ${stepIndex + 1}`}
    />
  );
}
