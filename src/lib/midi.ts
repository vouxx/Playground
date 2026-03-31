const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * MIDI 노트 번호 → 이름 (예: 60 → "C4")
 */
export function pitchToName(pitch: number): string {
  const octave = Math.floor(pitch / 12) - 1;
  const note = NOTE_NAMES[pitch % 12];
  return `${note}${octave}`;
}

/**
 * 노트 이름 → MIDI 노트 번호 (예: "C4" → 60)
 */
export function nameToPitch(name: string): number {
  const match = name.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60;
  const noteIndex = NOTE_NAMES.indexOf(match[1]);
  const octave = parseInt(match[2], 10);
  return (octave + 1) * 12 + noteIndex;
}

/**
 * MIDI 벨로시티(1~127) → 게인(0~1)
 */
export function velocityToGain(velocity: number): number {
  return Math.max(0, Math.min(1, velocity / 127));
}

/**
 * 해당 피치가 흑건인지 판별
 */
export function isBlackKey(pitch: number): boolean {
  const note = pitch % 12;
  return [1, 3, 6, 8, 10].includes(note);
}

/**
 * 피아노롤 표시 범위 (C1=24 ~ C7=96)
 */
export const PIANO_ROLL_MIN_PITCH = 24;
export const PIANO_ROLL_MAX_PITCH = 96;
export const PIANO_ROLL_PITCH_COUNT = PIANO_ROLL_MAX_PITCH - PIANO_ROLL_MIN_PITCH;
