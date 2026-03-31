import { tickToPixel, pixelToTick } from '@/lib/units';

/**
 * 뷰포트 상태를 관리하고, 틱↔픽셀 변환을 제공하는 매니저
 * Canvas 렌더러들이 공유한다.
 */
export class ViewportManager {
  scrollX = 0;      // ticks
  scrollY = 0;      // pixels
  pixelsPerTick = 0.15;
  canvasWidth = 0;
  canvasHeight = 0;
  trackHeaderWidth = 200;
  trackHeight = 60;

  update(params: {
    scrollX: number;
    scrollY: number;
    pixelsPerTick: number;
    canvasWidth: number;
    canvasHeight: number;
  }): void {
    this.scrollX = params.scrollX;
    this.scrollY = params.scrollY;
    this.pixelsPerTick = params.pixelsPerTick;
    this.canvasWidth = params.canvasWidth;
    this.canvasHeight = params.canvasHeight;
  }

  /** 틱 → 캔버스 X 좌표 */
  tickToX(tick: number): number {
    return tickToPixel(tick, this.pixelsPerTick, this.scrollX);
  }

  /** 캔버스 X 좌표 → 틱 */
  xToTick(x: number): number {
    return pixelToTick(x, this.pixelsPerTick, this.scrollX);
  }

  /** 트랙 인덱스 → 캔버스 Y 좌표 */
  trackIndexToY(index: number): number {
    return index * this.trackHeight - this.scrollY;
  }

  /** 캔버스 Y 좌표 → 트랙 인덱스 */
  yToTrackIndex(y: number): number {
    return Math.floor((y + this.scrollY) / this.trackHeight);
  }

  /** 뷰포트에 보이는 틱 범위 */
  getVisibleTickRange(): { startTick: number; endTick: number } {
    const startTick = this.scrollX;
    const endTick = this.scrollX + this.canvasWidth / this.pixelsPerTick;
    return { startTick, endTick };
  }

  /** 뷰포트에 보이는 트랙 인덱스 범위 */
  getVisibleTrackRange(): { startIndex: number; endIndex: number } {
    const startIndex = Math.floor(this.scrollY / this.trackHeight);
    const endIndex = Math.ceil(
      (this.scrollY + this.canvasHeight) / this.trackHeight,
    );
    return { startIndex, endIndex };
  }
}
