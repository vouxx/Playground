import type { MidiNote } from '@/types/daw';

export type Genre = 'pop' | 'rock' | 'jazz' | 'edm' | 'lofi';
export type GenerationType = 'chords' | 'melody' | 'drums' | 'bass' | 'full';
export type Complexity = 'simple' | 'medium' | 'complex';

export interface GenerationRequest {
  type: GenerationType;
  key: string;          // e.g. "C", "Am"
  genre: Genre;
  bars: number;
  beatsPerBar: number;
  bpm: number;
  complexity: Complexity;
  /** 코드 트랙의 노트 (멜로디 생성 시 참조) */
  referenceNotes?: MidiNote[];
}

export interface GenerationResult {
  notes: Omit<MidiNote, 'id' | 'regionId'>[];
  suggestedPreset: string;
  trackName: string;
}

/**
 * AI 생성 어댑터 인터페이스 (Constitution VI)
 */
export interface AIAdapter {
  name: string;
  generate(request: GenerationRequest): Promise<GenerationResult>;
}
