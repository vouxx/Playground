'use client';

type Mode = 'sequencer' | 'pad' | 'piano';

interface ModeTabProps {
  mode: Mode;
  onChangeMode: (mode: Mode) => void;
}

const TABS: { key: Mode; label: string }[] = [
  { key: 'sequencer', label: 'Sequencer' },
  { key: 'pad', label: 'Pad' },
  { key: 'piano', label: 'Piano Roll' },
];

export default function ModeTab({ mode, onChangeMode }: ModeTabProps) {
  return (
    <nav className="flex gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800">
      {TABS.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onChangeMode(key)}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === key
              ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-100'
              : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
          }`}
          aria-selected={mode === key}
          role="tab"
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
