'use client';

import { useRef, useEffect, useCallback } from 'react';
import { usePianoRoll } from '@/hooks/usePianoRoll';
import { usePianoRollStore } from '@/store/usePianoRollStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useTrackStore } from '@/store/useTrackStore';
import { PianoRollInteraction } from '@/canvas/PianoRollInteraction';
import { getSynth } from '@/engine/instruments';
import { triggerDrum } from '@/engine/drumkit';
import { ensureAudioContext } from '@/engine/transport';
import { pitchToName, velocityToGain } from '@/lib/midi';

export default function PianoRollPanel() {
  const openRegionId = usePianoRollStore((s) => s.openRegionId);
  const closeRegion = usePianoRollStore((s) => s.closeRegion);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = usePianoRoll(canvasRef);

  // Canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // renderer가 매 프레임 DPR을 처리하므로 여기서는 style만 맞춤
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Interaction handler
  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer || !openRegionId) return;

    // 미리 듣기 헬퍼
    const audition = async (pitch: number) => {
      await ensureAudioContext();
      const region = useRegionStore.getState().regions[openRegionId];
      if (!region) return;
      const track = useTrackStore.getState().tracks[region.trackId];
      if (!track) return;
      if (track.type === 'drum') {
        triggerDrum(pitch, undefined, 0.8);
      } else {
        const synth = getSynth(track.id, track.instrumentId);
        synth.toDestination();
        const name = pitchToName(pitch);
        if ('triggerAttackRelease' in synth) {
          synth.triggerAttackRelease(name, '16n', undefined, 0.6);
        }
      }
    };

    const handler = new PianoRollInteraction(canvas, renderer, {
      onNoteCreate: (pitch, startTick) => {
        const id = useMidiStore.getState().addNote(openRegionId, pitch, startTick);
        usePianoRollStore.getState().selectNote(id);
        audition(pitch);
      },
      onNoteMove: (id, pitch, startTick) => {
        useMidiStore.getState().moveNote(id, pitch, startTick);
      },
      onNoteResize: (id, durationTicks) => {
        useMidiStore.getState().resizeNote(id, durationTicks);
      },
      onNoteSelect: (id, add) => {
        usePianoRollStore.getState().selectNote(id, add);
      },
      onNoteDelete: () => {
        const ids = usePianoRollStore.getState().selectedNoteIds;
        for (const id of ids) useMidiStore.getState().removeNote(id);
        usePianoRollStore.getState().deselectAllNotes();
      },
      onDeselectAll: () => {
        usePianoRollStore.getState().deselectAllNotes();
      },
      getNotes: () => {
        return useMidiStore.getState().getNotesByRegion(openRegionId);
      },
      getSelectedIds: () => usePianoRollStore.getState().selectedNoteIds,
      getBeatsPerBar: () => useProjectStore.getState().timeSignature[0],
      getPixelsPerTick: () => usePianoRollStore.getState().pixelsPerTick,
      getNoteHeight: () => usePianoRollStore.getState().noteHeight,
    });

    return () => handler.dispose();
  }, [rendererRef, openRegionId]);

  // Wheel: scroll + zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const store = usePianoRollStore.getState();
    if (e.metaKey || e.ctrlKey) {
      const newZoom = e.deltaY < 0
        ? store.pixelsPerTick * 1.2
        : store.pixelsPerTick / 1.2;
      store.setZoom(newZoom);
    } else if (e.shiftKey) {
      store.setScrollY(store.scrollY + e.deltaY);
    } else {
      const tickDelta = e.deltaY / store.pixelsPerTick;
      store.setScrollX(store.scrollX + tickDelta);
    }
  }, []);

  if (!openRegionId) return null;

  return (
    <div className="flex flex-col border-t border-zinc-700">
      {/* Toolbar */}
      <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5">
        <span className="text-xs font-medium text-zinc-300">피아노롤</span>
        <div className="flex-1" />
        <button
          onClick={closeRegion}
          className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
        >
          닫기
        </button>
      </div>
      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative h-[250px] overflow-hidden"
        onWheel={handleWheel}
      >
        <canvas ref={canvasRef} className="absolute inset-0" tabIndex={0} />
      </div>
    </div>
  );
}
