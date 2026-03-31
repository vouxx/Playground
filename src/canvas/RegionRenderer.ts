import type { Region } from '@/types/daw';
import type { ViewportManager } from './ViewportManager';
import { RULER_HEIGHT } from './GridRenderer';

const REGION_RADIUS = 4;
const REGION_PADDING = 2;
const SELECTION_BORDER = '#FFFFFF';
const REGION_NAME_COLOR = 'rgba(255,255,255,0.8)';

/**
 * 리전 블록을 Canvas에 렌더링
 */
export class RegionRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: ViewportManager;

  constructor(ctx: CanvasRenderingContext2D, viewport: ViewportManager) {
    this.ctx = ctx;
    this.viewport = viewport;
  }

  render(
    regions: Region[],
    trackOrder: string[],
    trackColors: Record<string, string>,
    selectedIds: string[],
  ): void {
    const { ctx, viewport } = this;
    const { startTick, endTick } = viewport.getVisibleTickRange();

    for (const region of regions) {
      // 뷰포트 밖이면 스킵 (가상화)
      const regionEnd = region.startTick + region.durationTicks;
      if (regionEnd < startTick || region.startTick > endTick) continue;

      const trackIndex = trackOrder.indexOf(region.trackId);
      if (trackIndex === -1) continue;

      const x = viewport.tickToX(region.startTick);
      const y = viewport.trackIndexToY(trackIndex) + REGION_PADDING + RULER_HEIGHT;
      const width = region.durationTicks * viewport.pixelsPerTick;
      const height = viewport.trackHeight - REGION_PADDING * 2;

      if (y + height < RULER_HEIGHT || y > viewport.canvasHeight) continue;

      const color = trackColors[region.trackId] || '#6366F1';
      const isSelected = selectedIds.includes(region.id);

      // Region body
      ctx.fillStyle = color + '88'; // semi-transparent
      this.roundRect(x, y, width, height, REGION_RADIUS);
      ctx.fill();

      // Region border
      ctx.strokeStyle = isSelected ? SELECTION_BORDER : color;
      ctx.lineWidth = isSelected ? 2 : 1;
      this.roundRect(x, y, width, height, REGION_RADIUS);
      ctx.stroke();

      // Region name
      if (width > 40) {
        ctx.fillStyle = REGION_NAME_COLOR;
        ctx.font = '10px monospace';
        ctx.fillText(
          region.name,
          x + 6,
          y + 14,
          width - 12,
        );
      }

      // Resize handles (선택 시만)
      if (isSelected) {
        this.drawResizeHandle(x, y, height);
        this.drawResizeHandle(x + width, y, height);
      }
    }
  }

  private drawResizeHandle(x: number, y: number, height: number): void {
    const { ctx } = this;
    ctx.fillStyle = SELECTION_BORDER;
    ctx.fillRect(x - 2, y + height / 2 - 8, 4, 16);
  }

  private roundRect(
    x: number, y: number, w: number, h: number, r: number,
  ): void {
    const { ctx } = this;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
