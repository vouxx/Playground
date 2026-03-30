'use client';

import { useSequencerStore } from '@/store/useSequencerStore';
import StepButton from './StepButton';
import TrackControl from '@/components/mixer/TrackControl';
import type { Track } from '@/types';

interface TrackRowProps {
  track: Track;
}

export default function TrackRow({ track }: TrackRowProps) {
  const currentStep = useSequencerStore((s) => s.currentStep);
  const toggleStep = useSequencerStore((s) => s.toggleStep);
  const setVolume = useSequencerStore((s) => s.setVolume);
  const toggleMute = useSequencerStore((s) => s.toggleMute);
  const toggleSolo = useSequencerStore((s) => s.toggleSolo);

  return (
    <div className="flex items-center gap-2 py-1">
      <span className="w-16 shrink-0 text-right text-xs font-medium text-zinc-600 dark:text-zinc-400">
        {track.name}
      </span>

      <div className="flex items-center">
        {track.steps.map((active, i) => (
          <StepButton
            key={i}
            active={active}
            isCurrentStep={currentStep === i}
            stepIndex={i}
            onToggle={() => toggleStep(track.id, i)}
          />
        ))}
      </div>

      <TrackControl
        volume={track.volume}
        mute={track.mute}
        solo={track.solo}
        onVolumeChange={(v) => setVolume(track.id, v)}
        onToggleMute={() => toggleMute(track.id)}
        onToggleSolo={() => toggleSolo(track.id)}
      />
    </div>
  );
}
