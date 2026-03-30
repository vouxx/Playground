'use client';

import { useState } from 'react';
import type { DrumType } from '@/types';

interface DrumPadProps {
  drum: DrumType;
  name: string;
  shortcut: string;
  onTrigger: (drum: DrumType) => void;
}

const PAD_COLORS: Record<DrumType, string> = {
  kick: 'bg-red-500 hover:bg-red-400 active:bg-red-300',
  snare: 'bg-orange-500 hover:bg-orange-400 active:bg-orange-300',
  hihat: 'bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-300',
  openhat: 'bg-green-500 hover:bg-green-400 active:bg-green-300',
  clap: 'bg-teal-500 hover:bg-teal-400 active:bg-teal-300',
  rim: 'bg-blue-500 hover:bg-blue-400 active:bg-blue-300',
  tom: 'bg-indigo-500 hover:bg-indigo-400 active:bg-indigo-300',
  cymbal: 'bg-purple-500 hover:bg-purple-400 active:bg-purple-300',
};

export default function DrumPad({ drum, name, shortcut, onTrigger }: DrumPadProps) {
  const [pressed, setPressed] = useState(false);

  const handleTrigger = () => {
    onTrigger(drum);
    setPressed(true);
    setTimeout(() => setPressed(false), 100);
  };

  return (
    <button
      onMouseDown={handleTrigger}
      className={`flex flex-col items-center justify-center rounded-xl text-white shadow-lg transition-transform ${
        PAD_COLORS[drum]
      } ${pressed ? 'scale-90' : 'scale-100'} h-28 w-28 select-none`}
      aria-label={`${name} 패드`}
    >
      <span className="text-sm font-bold">{name}</span>
      <span className="mt-1 text-xs opacity-70">{shortcut.toUpperCase()}</span>
    </button>
  );
}
