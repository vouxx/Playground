import { PPQ } from '@/types/daw';
import { getSnapResolution } from '@/lib/snap';
import type { ViewportManager } from './ViewportManager';

const GRID_COLOR_MAJOR = 'rgba(255,255,255,0.15)';
const GRID_COLOR_MINOR = 'rgba(255,255,255,0.06)';
const BAR_NUMBER_COLOR = 'rgba(255,255,255,0.4)';
const RULER_BG = 'rgba(255,255,255,0.03)';
const RULER_HEIGHT = 24;

/**
 * 마디/박자 그리드를 Canvas에 렌더링
 */
export class GridRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: ViewportManager;

  constructor(ctx: CanvasRenderingContext2D, viewport: ViewportManager) {
    this.ctx = ctx;
    this.viewport = viewport;
  }

  render(beatsPerBar: number, trackCount: number): void {
    const { ctx, viewport } = this;
    const { startTick, endTick } = viewport.getVisibleTickRange();
    const ticksPerBar = beatsPerBar * PPQ;
    const snapRes = getSnapResolution(viewport.pixelsPerTick, beatsPerBar);
    const contentHeight = Math.max(
      trackCount * viewport.trackHeight,
      viewport.canvasHeight,
    );

    // Ruler background
    ctx.fillStyle = RULER_BG;
    ctx.fillRect(0, 0, viewport.canvasWidth, RULER_HEIGHT);

    // Draw grid lines
    const firstTick = Math.floor(startTick / snapRes) * snapRes;

    for (let tick = firstTick; tick <= endTick; tick += snapRes) {
      const x = viewport.tickToX(tick);
      if (x < 0) continue;

      const isBar = tick % ticksPerBar === 0;
      ctx.strokeStyle = isBar ? GRID_COLOR_MAJOR : GRID_COLOR_MINOR;
      ctx.lineWidth = isBar ? 1 : 0.5;

      ctx.beginPath();
      ctx.moveTo(x, RULER_HEIGHT);
      ctx.lineTo(x, contentHeight);
      ctx.stroke();

      // Bar numbers in ruler
      if (isBar) {
        const barNum = Math.floor(tick / ticksPerBar) + 1;
        ctx.fillStyle = BAR_NUMBER_COLOR;
        ctx.font = '10px monospace';
        ctx.fillText(String(barNum), x + 4, RULER_HEIGHT - 6);
      }
    }

    // Track separator lines
    for (let i = 0; i <= trackCount; i++) {
      const y = viewport.trackIndexToY(i);
      if (y < RULER_HEIGHT || y > viewport.canvasHeight) continue;
      ctx.strokeStyle = GRID_COLOR_MINOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(viewport.canvasWidth, y);
      ctx.stroke();
    }
  }
}

export { RULER_HEIGHT };
