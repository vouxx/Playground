'use client';

import { useEffect, useRef } from 'react';
import { PianoRollRenderer, type PianoRollRenderState } from '@/canvas/PianoRollRenderer';
import { usePianoRollStore } from '@/store/usePianoRollStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';

export function usePianoRoll(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rendererRef = useRef<PianoRollRenderer | null>(null);

  const openRegionId = usePianoRollStore((s) => s.openRegionId);
  const scrollX = usePianoRollStore((s) => s.scrollX);
  const scrollY = usePianoRollStore((s) => s.scrollY);
  const pixelsPerTick = usePianoRollStore((s) => s.pixelsPerTick);
  const noteHeight = usePianoRollStore((s) => s.noteHeight);
  const selectedNoteIds = usePianoRollStore((s) => s.selectedNoteIds);
  const notes = useMidiStore((s) => s.notes);
  const regions = useRegionStore((s) => s.regions);
  const currentTick = useTransportStore((s) => s.currentTick);
  const timeSignature = useProjectStore((s) => s.timeSignature);
  const tracks = useTrackStore((s) => s.tracks);

  // Canvas가 마운트될 때 (openRegionId 변경으로 PianoRollPanel이 마운트/언마운트)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !openRegionId) return;

    const renderer = new PianoRollRenderer(canvas);
    rendererRef.current = renderer;
    renderer.start();

    return () => {
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef, openRegionId]);

  // 스토어 변경 시 렌더 상태 업데이트
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !openRegionId) return;

    const region = regions[openRegionId];
    if (!region) return;

    const track = tracks[region.trackId];
    const regionNotes = Object.values(notes).filter((n) => n.regionId === openRegionId);

    const state: PianoRollRenderState = {
      scrollX, scrollY, pixelsPerTick, noteHeight,
      notes: regionNotes,
      selectedNoteIds,
      currentTick,
      beatsPerBar: timeSignature[0],
      regionStartTick: region.startTick,
      regionDurationTicks: region.durationTicks,
      isDrumTrack: track?.type === 'drum',
    };
    renderer.setState(state);
  }, [
    openRegionId, scrollX, scrollY, pixelsPerTick, noteHeight,
    selectedNoteIds, notes, regions, currentTick, timeSignature, tracks,
  ]);

  return rendererRef;
}
