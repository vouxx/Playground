'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/layout/Header';
import ModeTab from '@/components/layout/ModeTab';
import ProjectActions from '@/components/layout/ProjectActions';
import StepGrid from '@/components/sequencer/StepGrid';
import PadGrid from '@/components/pad/PadGrid';
import PianoRollGrid from '@/components/piano/PianoRollGrid';
import PianoControls from '@/components/piano/PianoControls';
import TimelineGrid from '@/components/timeline/TimelineGrid';
import TimelineControls from '@/components/timeline/TimelineControls';
import EffectsPanel from '@/components/mixer/EffectsPanel';
import { useSequencer } from '@/hooks/useSequencer';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboard } from '@/hooks/useKeyboard';
import { useSequencerStore } from '@/store/useSequencerStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { decodeProjectFromUrl } from '@/lib/storage';

const Waveform = dynamic(() => import('@/components/visualizer/Waveform'), { ssr: false });

type Mode = 'sequencer' | 'pad' | 'piano' | 'timeline';

export default function BeatMakerPage() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { startSequencer, stopSequencer } = useSequencer();
  const isPlaying = useSequencerStore((s) => s.isPlaying);
  const [mode, setMode] = useState<Mode>('sequencer');

  const handlePlayToggle = useCallback(() => {
    if (useSequencerStore.getState().isPlaying) {
      stopSequencer();
    } else {
      startSequencer();
    }
  }, [startSequencer, stopSequencer]);

  useKeyboard({ onPlayToggle: handlePlayToggle });

  useEffect(() => {
    useTimelineStore.getState().setTimelineMode(mode === 'timeline');
  }, [mode]);

  // URL에서 프로젝트 로드
  useEffect(() => {
    decodeProjectFromUrl();
  }, []);

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
        <div className="flex w-full max-w-4xl items-center justify-between">
          <ModeTab mode={mode} onChangeMode={setMode} />
          <ProjectActions />
        </div>

        <Waveform />
        <EffectsPanel />

        {mode === 'sequencer' && <StepGrid />}
        {mode === 'pad' && <PadGrid />}
        {mode === 'piano' && (
          <>
            <PianoControls />
            <PianoRollGrid />
          </>
        )}
        {mode === 'timeline' && (
          <>
            <TimelineControls />
            <TimelineGrid />
          </>
        )}
      </main>
    </>
  );
}
