'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useTimeline } from '@/hooks/useTimeline';
import { useViewportStore } from '@/store/useViewportStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useProjectStore } from '@/store/useProjectStore';
import { usePianoRollStore } from '@/store/usePianoRollStore';
import { InteractionHandler } from '@/canvas/InteractionHandler';

/**
 * Canvas 요소를 마운트하고 TimelineRenderer + InteractionHandler와 연결하는 컴포넌트
 */
export default function TimelineCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useTimeline(canvasRef);

  // InteractionHandler 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    const handler = new InteractionHandler(canvas, renderer.viewport, {
      onRegionMove: (id, trackId, startTick) => {
        useRegionStore.getState().moveRegion(id, trackId, startTick);
      },
      onRegionResize: (id, durationTicks) => {
        useRegionStore.getState().resizeRegion(id, durationTicks);
      },
      onRegionCreate: (trackId, startTick) => {
        const id = useRegionStore.getState().addRegion(trackId, startTick);
        useViewportStore.getState().selectRegion(id);
      },
      onRegionSelect: (id, addToSelection) => {
        useViewportStore.getState().selectRegion(id, addToSelection);
      },
      onRegionDelete: () => {
        const ids = useViewportStore.getState().selectedRegionIds;
        for (const id of ids) {
          useRegionStore.getState().removeRegion(id);
        }
        useViewportStore.getState().deselectAll();
      },
      onDeselectAll: () => {
        useViewportStore.getState().deselectAll();
      },
      onRegionDoubleClick: (regionId: string) => {
        usePianoRollStore.getState().openRegion(regionId);
      },
      getTrackOrder: () => useProjectStore.getState().trackOrder,
      getRegions: () => Object.values(useRegionStore.getState().regions),
      getSelectedIds: () => useViewportStore.getState().selectedRegionIds,
      getBeatsPerBar: () => useProjectStore.getState().timeSignature[0],
    });

    return () => handler.dispose();
  }, [rendererRef]);

  // Canvas 크기를 컨테이너에 맞춤
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = window.devicePixelRatio || 1;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.scale(dpr, dpr);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Wheel: 가로 스크롤 + Cmd/Ctrl 줌
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const store = useViewportStore.getState();

    if (e.metaKey || e.ctrlKey) {
      if (e.deltaY < 0) {
        store.zoomIn();
      } else {
        store.zoomOut();
      }
    } else {
      const tickDelta = e.deltaY / store.pixelsPerTick;
      store.setScrollX(store.scrollX + tickDelta);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden"
      onWheel={handleWheel}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
      />
    </div>
  );
}
