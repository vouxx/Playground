import { ViewportManager } from './ViewportManager';
import { GridRenderer } from './GridRenderer';
import { PlayheadRenderer } from './PlayheadRenderer';
import { RegionRenderer } from './RegionRenderer';
import type { Region } from '@/types/daw';

const BG_COLOR = '#18181B'; // zinc-900

export interface TimelineRenderState {
  scrollX: number;
  scrollY: number;
  pixelsPerTick: number;
  currentTick: number;
  beatsPerBar: number;
  trackOrder: string[];
  trackColors: Record<string, string>;
  regions: Region[];
  selectedRegionIds: string[];
}

/**
 * 3-레이어 Canvas 타임라인 렌더러
 * 배경(그리드) + 콘텐츠(리전) + 오버레이(재생 헤드) 순서로 렌더링
 */
export class TimelineRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  viewport: ViewportManager;
  private grid: GridRenderer;
  private playhead: PlayheadRenderer;
  private region: RegionRenderer;
  private rafId: number | null = null;
  private state: TimelineRenderState | null = null;
  private dirty = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');
    this.ctx = ctx;

    this.viewport = new ViewportManager();
    this.grid = new GridRenderer(ctx, this.viewport);
    this.playhead = new PlayheadRenderer(ctx, this.viewport);
    this.region = new RegionRenderer(ctx, this.viewport);
  }

  /** 상태 업데이트 및 dirty 플래그 설정 */
  setState(state: TimelineRenderState): void {
    this.state = state;
    this.dirty = true;
  }

  /** 재생 헤드 위치만 업데이트 (매 프레임) */
  updatePlayhead(currentTick: number): void {
    if (this.state) {
      this.state.currentTick = currentTick;
      this.dirty = true;
    }
  }

  /** rAF 렌더 루프 시작 */
  start(): void {
    if (this.rafId !== null) return;
    const loop = (): void => {
      this.rafId = requestAnimationFrame(loop);
      if (!this.dirty || !this.state) return;
      this.render();
      this.dirty = false;
    };
    this.rafId = requestAnimationFrame(loop);
  }

  /** rAF 렌더 루프 정지 */
  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /** Canvas 크기 조정 (리사이즈 대응) */
  resize(width: number, height: number): void {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);
    this.dirty = true;
  }

  /** 단일 프레임 렌더링 */
  private render(): void {
    if (!this.state) return;
    const { ctx, viewport } = this;
    const s = this.state;

    viewport.update({
      scrollX: s.scrollX,
      scrollY: s.scrollY,
      pixelsPerTick: s.pixelsPerTick,
      canvasWidth: this.canvas.clientWidth,
      canvasHeight: this.canvas.clientHeight,
    });

    // Clear
    ctx.clearRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, this.canvas.clientWidth, this.canvas.clientHeight);

    // Layer 1: Grid (background)
    this.grid.render(s.beatsPerBar, s.trackOrder.length);

    // Layer 2: Regions (content)
    this.region.render(
      s.regions,
      s.trackOrder,
      s.trackColors,
      s.selectedRegionIds,
    );

    // Layer 3: Playhead (overlay)
    this.playhead.render(s.currentTick);
  }

  /** 리소스 해제 */
  dispose(): void {
    this.stop();
  }
}
