'use client';

import { useEffect, useRef } from 'react';
import { TimelineRenderer, type TimelineRenderState } from '@/canvas/TimelineRenderer';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useViewportStore } from '@/store/useViewportStore';

/**
 * Canvas ref를 받아 TimelineRenderer를 초기화하고,
 * 스토어 상태를 구독하여 렌더링을 트리거한다.
 */
export function useTimeline(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const rendererRef = useRef<TimelineRenderer | null>(null);

  // 스토어에서 필요한 상태 구독
  const bpm = useProjectStore((s) => s.bpm);
  const timeSignature = useProjectStore((s) => s.timeSignature);
  const trackOrder = useProjectStore((s) => s.trackOrder);
  const tracks = useTrackStore((s) => s.tracks);
  const regions = useRegionStore((s) => s.regions);
  const currentTick = useTransportStore((s) => s.currentTick);
  const isPlaying = useTransportStore((s) => s.isPlaying);
  const scrollX = useViewportStore((s) => s.scrollX);
  const scrollY = useViewportStore((s) => s.scrollY);
  const pixelsPerTick = useViewportStore((s) => s.pixelsPerTick);
  const selectedRegionIds = useViewportStore((s) => s.selectedRegionIds);

  // Canvas 초기화
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new TimelineRenderer(canvas);
    rendererRef.current = renderer;

    const handleResize = (): void => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) renderer.resize(rect.width, rect.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    renderer.start();

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      rendererRef.current = null;
    };
  }, [canvasRef]);

  // 스토어 변경 시 렌더 상태 업데이트
  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;

    const trackColors: Record<string, string> = {};
    for (const id of trackOrder) {
      if (tracks[id]) trackColors[id] = tracks[id].color;
    }

    const state: TimelineRenderState = {
      scrollX,
      scrollY,
      pixelsPerTick,
      currentTick,
      beatsPerBar: timeSignature[0],
      trackOrder,
      trackColors,
      regions: Object.values(regions),
      selectedRegionIds,
    };
    renderer.setState(state);
  }, [
    scrollX, scrollY, pixelsPerTick, currentTick,
    timeSignature, trackOrder, tracks, regions, selectedRegionIds,
  ]);

  // 재생 중 자동 스크롤
  useEffect(() => {
    if (!isPlaying) return;
    const renderer = rendererRef.current;
    if (!renderer) return;

    const canvasWidth = renderer.viewport.canvasWidth;
    const headX = renderer.viewport.tickToX(currentTick);

    // 재생 헤드가 캔버스 80% 지점을 넘으면 스크롤
    if (headX > canvasWidth * 0.8) {
      const newScrollX = currentTick - (canvasWidth * 0.2) / pixelsPerTick;
      useViewportStore.getState().setScrollX(Math.max(0, newScrollX));
    }
  }, [currentTick, isPlaying, pixelsPerTick]);

  return rendererRef;
}
