export type DrumType = 'kick' | 'snare' | 'hihat' | 'openhat' | 'clap' | 'rim' | 'tom' | 'cymbal';

export interface Track {
  id: DrumType;
  name: string;
  steps: boolean[];
  volume: number;
  mute: boolean;
  solo: boolean;
}

export const DRUM_KIT: { id: DrumType; name: string }[] = [
  { id: 'kick', name: 'Kick' },
  { id: 'snare', name: 'Snare' },
  { id: 'hihat', name: 'Hi-hat' },
  { id: 'openhat', name: 'Open Hat' },
  { id: 'clap', name: 'Clap' },
  { id: 'rim', name: 'Rim' },
  { id: 'tom', name: 'Tom' },
  { id: 'cymbal', name: 'Cymbal' },
];

export const STEP_COUNT = 16;

// Piano Roll types
export type SynthPreset = 'sine' | 'square' | 'triangle' | 'sawtooth';

export const PIANO_NOTES = [
  'B4', 'A#4', 'A4', 'G#4', 'G4', 'F#4', 'F4', 'E4', 'D#4', 'D4', 'C#4', 'C4',
  'B3', 'A#3', 'A3', 'G#3', 'G3', 'F#3', 'F3', 'E3', 'D#3', 'D3', 'C#3', 'C3',
] as const;

export type PianoNote = (typeof PIANO_NOTES)[number];

export interface ChordPreset {
  name: string;
  notes: PianoNote[];
}

export const CHORD_PRESETS: ChordPreset[] = [
  { name: 'C Maj', notes: ['C4', 'E4', 'G4'] },
  { name: 'D Min', notes: ['D4', 'F4', 'A4'] },
  { name: 'E Min', notes: ['E4', 'G4', 'B4'] },
  { name: 'F Maj', notes: ['F4', 'A4', 'C4'] },
  { name: 'G Maj', notes: ['G4', 'B4', 'D4'] },
  { name: 'A Min', notes: ['A4', 'C4', 'E4'] },
  { name: 'C Min', notes: ['C4', 'D#4', 'G4'] },
  { name: 'G7', notes: ['G3', 'B3', 'D4', 'F4'] },
];
