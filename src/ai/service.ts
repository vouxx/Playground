import type { AIAdapter, GenerationRequest, GenerationResult, Genre } from './types';
import { localAdapter } from './localAdapter';

let currentAdapter: AIAdapter = localAdapter;

/**
 * AI 어댑터 교체 (Constitution VI — 어댑터 패턴)
 */
export function setAdapter(adapter: AIAdapter): void {
  currentAdapter = adapter;
}

export function getAdapterName(): string {
  return currentAdapter.name;
}

/**
 * 단일 타입 생성
 */
export async function generate(req: GenerationRequest): Promise<GenerationResult> {
  return currentAdapter.generate(req);
}

/**
 * 장르 기반 풀 트랙 생성 (드럼 + 베이스 + 코드 + 멜로디)
 */
export async function generateFullTracks(
  key: string,
  genre: Genre,
  bars: number,
  beatsPerBar: number,
  bpm: number,
): Promise<GenerationResult[]> {
  const base: Omit<GenerationRequest, 'type'> = {
    key, genre, bars, beatsPerBar, bpm, complexity: 'medium',
  };

  const [drums, bass, chords, melody] = await Promise.all([
    currentAdapter.generate({ ...base, type: 'drums' }),
    currentAdapter.generate({ ...base, type: 'bass' }),
    currentAdapter.generate({ ...base, type: 'chords' }),
    currentAdapter.generate({ ...base, type: 'melody' }),
  ]);

  return [drums, bass, chords, melody];
}
