import type { MidiNote } from '@/types/daw';
import { PPQ } from '@/types/daw';

// === Key Signatures ===

export interface KeySignature {
  key: string;       // e.g. "C", "G", "D", "F", "Bb"
  mode: 'major' | 'minor';
  sharps: number;    // 양수: #, 음수: b
}

export const KEY_SIGNATURES: KeySignature[] = [
  { key: 'C', mode: 'major', sharps: 0 },
  { key: 'G', mode: 'major', sharps: 1 },
  { key: 'D', mode: 'major', sharps: 2 },
  { key: 'A', mode: 'major', sharps: 3 },
  { key: 'E', mode: 'major', sharps: 4 },
  { key: 'B', mode: 'major', sharps: 5 },
  { key: 'F', mode: 'major', sharps: -1 },
  { key: 'Bb', mode: 'major', sharps: -2 },
  { key: 'Eb', mode: 'major', sharps: -3 },
  { key: 'Ab', mode: 'major', sharps: -4 },
];

// === Velocity → Dynamic ===

export function velocityToDynamic(velocity: number): string {
  if (velocity <= 20) return 'pp';
  if (velocity <= 45) return 'p';
  if (velocity <= 65) return 'mp';
  if (velocity <= 85) return 'mf';
  if (velocity <= 105) return 'f';
  return 'ff';
}

// === MIDI Note → VexFlow Duration ===

interface QuantizedNote {
  vexDuration: string;  // e.g. "q", "8", "16", "h", "w", "qd"
  dots: number;
}

/**
 * 틱 기반 길이를 VexFlow 음표 길이로 변환 (16분음표 단위로 퀀타이즈)
 */
export function ticksToVexDuration(ticks: number): QuantizedNote {
  const sixteenth = PPQ / 4;  // 48
  const quantized = Math.round(ticks / sixteenth) * sixteenth;

  // 온음표 (4박)
  if (quantized >= PPQ * 4) return { vexDuration: 'w', dots: 0 };
  // 점2분음표 (3박)
  if (quantized >= PPQ * 3) return { vexDuration: 'h', dots: 1 };
  // 2분음표 (2박)
  if (quantized >= PPQ * 2) return { vexDuration: 'h', dots: 0 };
  // 점4분음표 (1.5박)
  if (quantized >= PPQ * 1.5) return { vexDuration: 'q', dots: 1 };
  // 4분음표 (1박)
  if (quantized >= PPQ) return { vexDuration: 'q', dots: 0 };
  // 점8분음표
  if (quantized >= sixteenth * 3) return { vexDuration: '8', dots: 1 };
  // 8분음표
  if (quantized >= sixteenth * 2) return { vexDuration: '8', dots: 0 };
  // 16분음표
  return { vexDuration: '16', dots: 0 };
}

// === MIDI Pitch → VexFlow Key ===

const NOTE_MAP: Record<number, string> = {
  0: 'c', 1: 'c#', 2: 'd', 3: 'd#', 4: 'e', 5: 'f',
  6: 'f#', 7: 'g', 8: 'g#', 9: 'a', 10: 'a#', 11: 'b',
};

/**
 * MIDI 피치 → VexFlow 키 문자열 (e.g. 60 → "c/4")
 */
export function pitchToVexKey(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  const note = NOTE_MAP[pitch % 12];
  return `${note}/${octave}`;
}

/**
 * 클레프 자동 선택: 평균 피치가 60(C4) 이상이면 treble, 아래면 bass
 */
export function autoSelectClef(notes: MidiNote[]): 'treble' | 'bass' {
  if (notes.length === 0) return 'treble';
  const avg = notes.reduce((sum, n) => sum + n.pitch, 0) / notes.length;
  return avg >= 60 ? 'treble' : 'bass';
}

/**
 * 노트를 마디별로 그룹핑
 */
export function groupNotesByBar(
  notes: MidiNote[],
  beatsPerBar: number,
): MidiNote[][] {
  const ticksPerBar = beatsPerBar * PPQ;
  const bars: MidiNote[][] = [];

  const sorted = [...notes].sort((a, b) => a.startTick - b.startTick);
  for (const note of sorted) {
    const barIndex = Math.floor(note.startTick / ticksPerBar);
    while (bars.length <= barIndex) bars.push([]);
    bars[barIndex].push(note);
  }

  return bars;
}
