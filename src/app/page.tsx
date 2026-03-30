'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ModeTab from '@/components/layout/ModeTab';
import StepGrid from '@/components/sequencer/StepGrid';
import PadGrid from '@/components/pad/PadGrid';
import PianoRollGrid from '@/components/piano/PianoRollGrid';
import PianoControls from '@/components/piano/PianoControls';
import { useSequencer } from '@/hooks/useSequencer';
import { useTheme } from '@/hooks/useTheme';
import { useSequencerStore } from '@/store/useSequencerStore';

type Mode = 'sequencer' | 'pad' | 'piano';

export default function BeatMakerPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { startSequencer, stopSequencer } = useSequencer();
  const isPlaying = useSequencerStore((s) => s.isPlaying);
  const [mode, setMode] = useState<Mode>('sequencer');

  return (
    <>
      <Header
        theme={theme}
        isPlaying={isPlaying}
        onToggleTheme={toggleTheme}
        onPlay={startSequencer}
        onStop={stopSequencer}
      />
      <main className="flex flex-1 flex-col items-center gap-4 overflow-auto p-6">
        <ModeTab mode={mode} onChangeMode={setMode} />
        {mode === 'sequencer' && <StepGrid />}
        {mode === 'pad' && <PadGrid />}
        {mode === 'piano' && (
          <>
            <PianoControls />
            <PianoRollGrid />
          </>
        )}
      </main>
    </>
  );
}
