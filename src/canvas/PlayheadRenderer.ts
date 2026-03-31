import type { ViewportManager } from './ViewportManager';
import { RULER_HEIGHT } from './GridRenderer';

const PLAYHEAD_COLOR = '#EF4444';
const PLAYHEAD_WIDTH = 1.5;

/**
 * 재생 헤드(수직선)를 Canvas에 렌더링
 */
export class PlayheadRenderer {
  private ctx: CanvasRenderingContext2D;
  private viewport: ViewportManager;

  constructor(ctx: CanvasRenderingContext2D, viewport: ViewportManager) {
    this.ctx = ctx;
    this.viewport = viewport;
  }

  render(currentTick: number): void {
    const { ctx, viewport } = this;
    const x = viewport.tickToX(currentTick);

    if (x < 0 || x > viewport.canvasWidth) return;

    // Playhead line
    ctx.strokeStyle = PLAYHEAD_COLOR;
    ctx.lineWidth = PLAYHEAD_WIDTH;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, viewport.canvasHeight);
    ctx.stroke();

    // Playhead triangle marker on ruler
    ctx.fillStyle = PLAYHEAD_COLOR;
    ctx.beginPath();
    ctx.moveTo(x - 5, 0);
    ctx.lineTo(x + 5, 0);
    ctx.lineTo(x, RULER_HEIGHT * 0.6);
    ctx.closePath();
    ctx.fill();
  }
}
