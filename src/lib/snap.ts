import { PPQ } from '@/types/daw';

/**
 * 줌 레벨(pixelsPerTick)에 따라 적절한 스냅 해상도(틱 단위)를 반환
 *
 * 줌 아웃 → 마디 단위 스냅
 * 줌 인   → 박자 → 8분 → 16분 단위 스냅
 */
export function getSnapResolution(
  pixelsPerTick: number,
  beatsPerBar: number = 4,
): number {
  const ticksPerBar = beatsPerBar * PPQ;
  const ticksPerBeat = PPQ;
  const ticksPer8th = PPQ / 2;
  const ticksPer16th = PPQ / 4;

  // 줌 레벨에 따른 최소 픽셀 간격 기준 (스냅 간격이 30px 이상이 되도록)
  const minPixelGap = 30;

  if (ticksPer16th * pixelsPerTick >= minPixelGap) return ticksPer16th;
  if (ticksPer8th * pixelsPerTick >= minPixelGap) return ticksPer8th;
  if (ticksPerBeat * pixelsPerTick >= minPixelGap) return ticksPerBeat;
  return ticksPerBar;
}

/**
 * 주어진 틱 값을 스냅 해상도에 맞춰 가장 가까운 그리드에 정렬
 */
export function snapToGrid(tick: number, snapResolution: number): number {
  if (snapResolution <= 0) return tick;
  return Math.round(tick / snapResolution) * snapResolution;
}

/**
 * 주어진 틱 값을 스냅 해상도에 맞춰 이전(왼쪽) 그리드에 정렬
 */
export function snapToGridFloor(tick: number, snapResolution: number): number {
  if (snapResolution <= 0) return tick;
  return Math.floor(tick / snapResolution) * snapResolution;
}
