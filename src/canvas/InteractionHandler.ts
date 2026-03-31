import type { ViewportManager } from './ViewportManager';
import type { Region } from '@/types/daw';
import { RULER_HEIGHT } from './GridRenderer';
import { snapToGrid, getSnapResolution } from '@/lib/snap';

type InteractionMode = 'none' | 'move' | 'resize-right' | 'resize-left' | 'scroll';

interface HitResult {
  type: 'region' | 'resize-left' | 'resize-right' | 'empty';
  regionId?: string;
  trackId?: string;
  tick?: number;
  trackIndex?: number;
}

interface Callbacks {
  onRegionMove: (id: string, trackId: string, startTick: number) => void;
  onRegionResize: (id: string, durationTicks: number) => void;
  onRegionCreate: (trackId: string, startTick: number) => void;
  onRegionSelect: (id: string, addToSelection: boolean) => void;
  onRegionDelete: () => void;
  onDeselectAll: () => void;
  onRegionDoubleClick: (regionId: string) => void;
  getTrackOrder: () => string[];
  getRegions: () => Region[];
  getSelectedIds: () => string[];
  getBeatsPerBar: () => number;
}

const HANDLE_WIDTH = 8;

/**
 * Canvas 위 마우스/키보드 이벤트를 처리하는 인터랙션 핸들러
 */
export class InteractionHandler {
  private viewport: ViewportManager;
  private callbacks: Callbacks;
  private canvas: HTMLCanvasElement;
  private mode: InteractionMode = 'none';
  private dragRegionId: string | null = null;
  private dragStartTick = 0;
  private dragStartTrackIndex = 0;
  private dragOffsetTick = 0;
  private originalStartTick = 0;
  private originalDuration = 0;

  constructor(
    canvas: HTMLCanvasElement,
    viewport: ViewportManager,
    callbacks: Callbacks,
  ) {
    this.canvas = canvas;
    this.viewport = viewport;
    this.callbacks = callbacks;
    this.attach();
  }

  private attach(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('dblclick', this.onDblClick);
    window.addEventListener('keydown', this.onKeyDown);
  }

  dispose(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('dblclick', this.onDblClick);
    window.removeEventListener('keydown', this.onKeyDown);
  }

  private getCanvasPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private hitTest(x: number, y: number): HitResult {
    const tick = this.viewport.xToTick(x);
    const trackIndex = this.viewport.yToTrackIndex(y - RULER_HEIGHT);
    const trackOrder = this.callbacks.getTrackOrder();
    const trackId = trackOrder[trackIndex];
    const regions = this.callbacks.getRegions();

    if (y < RULER_HEIGHT) {
      return { type: 'empty', tick, trackIndex: -1 };
    }

    // 리전 히트 테스트 (역순 — 위에 있는 것 우선)
    for (let i = regions.length - 1; i >= 0; i--) {
      const region = regions[i];
      const rTrackIndex = trackOrder.indexOf(region.trackId);
      if (rTrackIndex !== trackIndex) continue;

      const rx = this.viewport.tickToX(region.startTick);
      const rw = region.durationTicks * this.viewport.pixelsPerTick;

      if (x >= rx && x <= rx + rw) {
        // 리사이즈 핸들 확인
        if (x <= rx + HANDLE_WIDTH) {
          return { type: 'resize-left', regionId: region.id };
        }
        if (x >= rx + rw - HANDLE_WIDTH) {
          return { type: 'resize-right', regionId: region.id };
        }
        return { type: 'region', regionId: region.id };
      }
    }

    return { type: 'empty', tick, trackIndex, trackId };
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    const { x, y } = this.getCanvasPos(e);
    const hit = this.hitTest(x, y);

    if (hit.type === 'region' && hit.regionId) {
      this.mode = 'move';
      this.dragRegionId = hit.regionId;
      const region = this.callbacks.getRegions().find((r) => r.id === hit.regionId);
      if (region) {
        this.dragOffsetTick = this.viewport.xToTick(x) - region.startTick;
        this.originalStartTick = region.startTick;
        this.dragStartTrackIndex = this.callbacks.getTrackOrder().indexOf(region.trackId);
      }
      this.callbacks.onRegionSelect(hit.regionId, e.shiftKey);
    } else if (hit.type === 'resize-right' && hit.regionId) {
      this.mode = 'resize-right';
      this.dragRegionId = hit.regionId;
      const region = this.callbacks.getRegions().find((r) => r.id === hit.regionId);
      if (region) this.originalDuration = region.durationTicks;
      this.callbacks.onRegionSelect(hit.regionId, false);
    } else if (hit.type === 'resize-left' && hit.regionId) {
      this.mode = 'resize-left';
      this.dragRegionId = hit.regionId;
      const region = this.callbacks.getRegions().find((r) => r.id === hit.regionId);
      if (region) {
        this.originalStartTick = region.startTick;
        this.originalDuration = region.durationTicks;
      }
      this.callbacks.onRegionSelect(hit.regionId, false);
    } else {
      this.mode = 'none';
      this.callbacks.onDeselectAll();
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.mode === 'none' || !this.dragRegionId) {
      // Update cursor
      const { x, y } = this.getCanvasPos(e);
      const hit = this.hitTest(x, y);
      if (hit.type === 'resize-left' || hit.type === 'resize-right') {
        this.canvas.style.cursor = 'ew-resize';
      } else if (hit.type === 'region') {
        this.canvas.style.cursor = 'grab';
      } else {
        this.canvas.style.cursor = 'default';
      }
      return;
    }

    const { x, y } = this.getCanvasPos(e);
    const beatsPerBar = this.callbacks.getBeatsPerBar();
    const snapRes = getSnapResolution(this.viewport.pixelsPerTick, beatsPerBar);
    const tick = this.viewport.xToTick(x);

    if (this.mode === 'move') {
      const trackIndex = this.viewport.yToTrackIndex(y - RULER_HEIGHT);
      const trackOrder = this.callbacks.getTrackOrder();
      const clampedIndex = Math.max(0, Math.min(trackOrder.length - 1, trackIndex));
      const targetTrackId = trackOrder[clampedIndex];
      const newTick = snapToGrid(tick - this.dragOffsetTick, snapRes);
      this.callbacks.onRegionMove(this.dragRegionId, targetTrackId, Math.max(0, newTick));
      this.canvas.style.cursor = 'grabbing';
    } else if (this.mode === 'resize-right') {
      const region = this.callbacks.getRegions().find((r) => r.id === this.dragRegionId);
      if (region) {
        const newEnd = snapToGrid(tick, snapRes);
        const newDuration = Math.max(snapRes, newEnd - region.startTick);
        this.callbacks.onRegionResize(this.dragRegionId, newDuration);
      }
    } else if (this.mode === 'resize-left') {
      const region = this.callbacks.getRegions().find((r) => r.id === this.dragRegionId);
      if (region) {
        const newStart = snapToGrid(tick, snapRes);
        const endTick = this.originalStartTick + this.originalDuration;
        const newDuration = endTick - newStart;
        if (newDuration >= snapRes && newStart >= 0) {
          this.callbacks.onRegionMove(this.dragRegionId, region.trackId, newStart);
          this.callbacks.onRegionResize(this.dragRegionId, newDuration);
        }
      }
    }
  };

  private onMouseUp = (): void => {
    this.mode = 'none';
    this.dragRegionId = null;
    this.canvas.style.cursor = 'default';
  };

  private onDblClick = (e: MouseEvent): void => {
    const { x, y } = this.getCanvasPos(e);
    const hit = this.hitTest(x, y);

    if (hit.type === 'region' && hit.regionId) {
      this.callbacks.onRegionDoubleClick(hit.regionId);
    } else if (hit.type === 'empty' && hit.trackId !== undefined) {
      const beatsPerBar = this.callbacks.getBeatsPerBar();
      const snapRes = getSnapResolution(this.viewport.pixelsPerTick, beatsPerBar);
      const tick = snapToGrid(hit.tick ?? 0, snapRes);
      this.callbacks.onRegionCreate(hit.trackId, Math.max(0, tick));
    }
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedIds = this.callbacks.getSelectedIds();
      if (selectedIds.length > 0) {
        e.preventDefault();
        this.callbacks.onRegionDelete();
      }
    }
  };
}
