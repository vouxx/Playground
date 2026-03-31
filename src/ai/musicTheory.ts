import { PPQ } from '@/types/daw';

// === Scale definitions ===

const MAJOR_INTERVALS = [0, 2, 4, 5, 7, 9, 11];
const MINOR_INTERVALS = [0, 2, 3, 5, 7, 8, 10];

const ROOT_MAP: Record<string, number> = {
  'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3,
  'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8,
  'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11,
};

export function parseKey(key: string): { root: number; isMinor: boolean } {
  const isMinor = key.endsWith('m');
  const rootName = isMinor ? key.slice(0, -1) : key;
  const root = ROOT_MAP[rootName] ?? 0;
  return { root, isMinor };
}

export function getScaleNotes(root: number, isMinor: boolean): number[] {
  const intervals = isMinor ? MINOR_INTERVALS : MAJOR_INTERVALS;
  return intervals.map((i) => (root + i) % 12);
}

/** 다이어토닉 코드 (도수별 3화음) */
export function getDiatonicChords(root: number, isMinor: boolean): number[][] {
  const scale = getScaleNotes(root, isMinor);
  return scale.map((_, i) => [
    scale[i],
    scale[(i + 2) % 7],
    scale[(i + 4) % 7],
  ]);
}

/** 스케일 음에서 가장 가까운 음 찾기 */
export function snapToScale(pitch: number, scaleNotes: number[]): number {
  const pc = pitch % 12;
  let closest = scaleNotes[0];
  let minDist = 12;
  for (const sn of scaleNotes) {
    const dist = Math.min(Math.abs(pc - sn), 12 - Math.abs(pc - sn));
    if (dist < minDist) { minDist = dist; closest = sn; }
  }
  return pitch - pc + closest + (closest < pc - 6 ? 12 : closest > pc + 6 ? -12 : 0);
}

/** 랜덤 정수 (min~max 포함) */
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 배열에서 랜덤 선택 */
export function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 틱 상수 */
export const TICKS_PER_BAR_4_4 = 4 * PPQ;
export const TICKS_PER_BEAT = PPQ;
export const TICKS_PER_8TH = PPQ / 2;
export const TICKS_PER_16TH = PPQ / 4;
