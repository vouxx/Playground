'use client';

import { useCallback, useRef, useState } from 'react';
import TimelineToolbar from '@/components/timeline/TimelineToolbar';
import TrackHeader from '@/components/timeline/TrackHeader';
import TimelineCanvas from '@/components/timeline/TimelineCanvas';
import PianoRollPanel from '@/components/pianoroll/PianoRollPanel';
import DrumPadGrid from '@/components/drumpad/DrumPadGrid';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useViewportStore } from '@/store/useViewportStore';
import { usePianoRollStore } from '@/store/usePianoRollStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useMixer } from '@/hooks/useMixer';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useScheduler } from '@/hooks/useScheduler';
import { useMidiInput } from '@/hooks/useMidiInput';
import { useRecorder } from '@/hooks/useRecorder';
import { useEffects } from '@/hooks/useEffects';
import EffectChainPanel from '@/components/effects/EffectChainPanel';
import ScorePanel from '@/components/score/ScorePanel';
import AIPanel from '@/components/ai/AIPanel';
import { useScoreStore } from '@/store/useScoreStore';

export default function DAWPage() {
  useMixer();
  useKeyboardShortcuts();
  useScheduler();
  const { devices } = useMidiInput();
  useRecorder();
  useEffects();

  const trackOrder = useProjectStore((s) => s.trackOrder);
  const reorderTracks = useProjectStore((s) => s.reorderTracks);
  const tracks = useTrackStore((s) => s.tracks);
  const openRegionId = usePianoRollStore((s) => s.openRegionId);
  const regions = useRegionStore((s) => s.regions);
  const trackPanelRef = useRef<HTMLDivElement>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [showDrumPad, setShowDrumPad] = useState(false);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [showAI, setShowAI] = useState(false);

  // Determine if opened region is on a drum track
  const openRegion = openRegionId ? regions[openRegionId] : null;
  const openTrack = openRegion ? tracks[openRegion.trackId] : null;
  const isDrumTrack = openTrack?.type === 'drum';

  const handleTrackScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    useViewportStore.getState().setScrollY(e.currentTarget.scrollTop);
  }, []);

  const handleDragStart = useCallback((index: number) => setDragIndex(index), []);
  const handleDragOver = useCallback(
    (targetIndex: number) => {
      if (dragIndex === null || dragIndex === targetIndex) return;
      reorderTracks(dragIndex, targetIndex);
      setDragIndex(targetIndex);
    },
    [dragIndex, reorderTracks],
  );
  const handleDragEnd = useCallback(() => setDragIndex(null), []);

  return (
    <div className="flex h-full flex-col bg-zinc-900 text-zinc-100">
      <TimelineToolbar
        midiDeviceCount={devices.length}
        onToggleDrumPad={() => setShowDrumPad((v) => !v)}
        showDrumPad={showDrumPad}
        onToggleScore={() => {
          const store = useScoreStore.getState();
          if (store.isOpen) { store.closeScore(); }
          else if (selectedTrackId) { store.openScore(selectedTrackId); }
        }}
        showScore={useScoreStore.getState().isOpen}
        onToggleAI={() => setShowAI((v) => !v)}
        showAI={showAI}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Track headers */}
        <div
          ref={trackPanelRef}
          className="w-[200px] flex-shrink-0 overflow-y-auto border-r border-zinc-700 bg-zinc-800"
          style={{ paddingTop: 24 }}
          onScroll={handleTrackScroll}
        >
          {trackOrder.map((id, i) => {
            const track = tracks[id];
            if (!track) return null;
            return (
              <TrackHeader
                key={id}
                track={track}
                index={i}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
                onSelect={() => setSelectedTrackId(id)}
                selected={selectedTrackId === id}
              />
            );
          })}
          {trackOrder.length === 0 && (
            <div className="flex h-full items-center justify-center text-xs text-zinc-500">
              트랙을 추가하세요
            </div>
          )}
        </div>

        {/* Main area */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <TimelineCanvas />

          {/* Drum pad */}
          {showDrumPad && (
            <div className="border-t border-zinc-700 bg-zinc-800">
              <DrumPadGrid activeRegionId={openRegionId} />
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {(showAI || selectedTrackId) && (
          <div className="w-[220px] flex-shrink-0 overflow-y-auto border-l border-zinc-700 bg-zinc-800">
            {showAI && (
              <AIPanel onClose={() => setShowAI(false)} />
            )}
            {selectedTrackId && !showAI && (
              <>
                <div className="flex items-center justify-between border-b border-zinc-700 px-2 py-1.5">
                  <span className="text-[10px] font-medium text-zinc-300">
                    {tracks[selectedTrackId]?.name}
                  </span>
                  <button
                    onClick={() => setSelectedTrackId(null)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300"
                  >
                    ✕
                  </button>
                </div>
                <EffectChainPanel trackId={selectedTrackId} />
              </>
            )}
          </div>
        )}
      </div>

      {/* Piano roll (bottom panel) */}
      <PianoRollPanel />

      {/* Score panel */}
      <ScorePanel />
    </div>
  );
}
