import { PPQ } from '@/types/daw';

/**
 * 틱 → 마디 번호 (1-based)
 */
export function tickToBar(tick: number, beatsPerBar: number = 4): number {
  const ticksPerBar = beatsPerBar * PPQ;
  return Math.floor(tick / ticksPerBar) + 1;
}

/**
 * 마디 번호 (1-based) → 틱
 */
export function barToTick(bar: number, beatsPerBar: number = 4): number {
  const ticksPerBar = beatsPerBar * PPQ;
  return (bar - 1) * ticksPerBar;
}

/**
 * 틱 → 마디:박자:틱 문자열 (1-based)
 */
export function tickToTimeString(
  tick: number,
  beatsPerBar: number = 4,
): string {
  const ticksPerBar = beatsPerBar * PPQ;
  const bar = Math.floor(tick / ticksPerBar) + 1;
  const remainingAfterBar = tick % ticksPerBar;
  const beat = Math.floor(remainingAfterBar / PPQ) + 1;
  const subTick = remainingAfterBar % PPQ;
  return `${bar}:${beat}:${String(subTick).padStart(3, '0')}`;
}

/**
 * 틱 → 픽셀 (뷰포트 기준)
 */
export function tickToPixel(
  tick: number,
  pixelsPerTick: number,
  scrollX: number = 0,
): number {
  return (tick - scrollX) * pixelsPerTick;
}

/**
 * 픽셀 → 틱 (뷰포트 기준)
 */
export function pixelToTick(
  pixel: number,
  pixelsPerTick: number,
  scrollX: number = 0,
): number {
  return pixel / pixelsPerTick + scrollX;
}

/**
 * 초 → 틱 (BPM 기반)
 */
export function secondsToTick(seconds: number, bpm: number): number {
  const beatsPerSecond = bpm / 60;
  return Math.round(seconds * beatsPerSecond * PPQ);
}

/**
 * 틱 → 초 (BPM 기반)
 */
export function tickToSeconds(tick: number, bpm: number): number {
  const beatsPerSecond = bpm / 60;
  return tick / (beatsPerSecond * PPQ);
}

/**
 * 4/4 기준 1마디의 틱 수
 */
export function ticksPerBar(beatsPerBar: number = 4): number {
  return beatsPerBar * PPQ;
}
