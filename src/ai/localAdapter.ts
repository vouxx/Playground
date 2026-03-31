import type { AIAdapter, GenerationRequest, GenerationResult } from './types';
import type { MidiNote } from '@/types/daw';
import { PPQ } from '@/types/daw';
import {
  parseKey, getScaleNotes, getDiatonicChords,
  snapToScale, randInt, pick,
  TICKS_PER_BAR_4_4, TICKS_PER_BEAT, TICKS_PER_8TH, TICKS_PER_16TH,
} from './musicTheory';

type NoteData = Omit<MidiNote, 'id' | 'regionId'>;

// === Chord generation ===

const CHORD_PROGRESSIONS: Record<string, number[][]> = {
  pop:  [[0,4,5,3], [0,5,3,4], [0,3,4,4], [5,3,0,4]],
  rock: [[0,3,4,4], [0,4,5,3], [0,0,3,4]],
  jazz: [[1,4,0,3], [1,4,0,0], [5,1,4,0]],
  edm:  [[0,5,3,4], [0,4,5,3], [5,5,3,4]],
  lofi: [[1,4,0,3], [3,5,0,4], [0,3,1,4]],
};

function generateChords(req: GenerationRequest): NoteData[] {
  const { root, isMinor } = parseKey(req.key);
  const chords = getDiatonicChords(root, isMinor);
  const progressions = CHORD_PROGRESSIONS[req.genre] || CHORD_PROGRESSIONS.pop;
  const progression = pick(progressions);
  const notes: NoteData[] = [];
  const barsPerChord = Math.max(1, Math.floor(req.bars / progression.length));

  for (let i = 0; i < req.bars; i++) {
    const chordIdx = progression[i % progression.length];
    const chord = chords[chordIdx];
    const octave = 4;
    const startTick = i * TICKS_PER_BAR_4_4;
    const duration = TICKS_PER_BAR_4_4;

    for (const pc of chord) {
      notes.push({
        pitch: pc + octave * 12 + 12,
        startTick,
        durationTicks: duration,
        velocity: randInt(70, 90),
      });
    }
  }
  return notes;
}

// === Melody generation ===

function generateMelody(req: GenerationRequest): NoteData[] {
  const { root, isMinor } = parseKey(req.key);
  const scale = getScaleNotes(root, isMinor);
  const notes: NoteData[] = [];
  const octave = 5;
  let prevPitch = root + octave * 12 + 12;

  const durations = req.complexity === 'simple'
    ? [TICKS_PER_BEAT, TICKS_PER_BEAT * 2]
    : req.complexity === 'complex'
    ? [TICKS_PER_16TH, TICKS_PER_8TH, TICKS_PER_BEAT, TICKS_PER_BEAT * 2]
    : [TICKS_PER_8TH, TICKS_PER_BEAT];

  let tick = 0;
  const totalTicks = req.bars * TICKS_PER_BAR_4_4;

  while (tick < totalTicks) {
    // Rest probability
    if (Math.random() < 0.15) {
      tick += pick(durations);
      continue;
    }

    const interval = randInt(-3, 3);
    const targetPitch = prevPitch + interval;
    const snapped = snapToScale(targetPitch, scale);
    const clamped = Math.max(48, Math.min(84, snapped));
    const dur = pick(durations);

    if (tick + dur <= totalTicks) {
      notes.push({
        pitch: clamped,
        startTick: tick,
        durationTicks: dur,
        velocity: randInt(75, 110),
      });
      prevPitch = clamped;
    }
    tick += dur;
  }
  return notes;
}

// === Drum pattern generation ===

const DRUM_PATTERNS: Record<string, { pitch: number; pattern: number[] }[]> = {
  pop: [
    { pitch: 36, pattern: [1,0,0,0, 1,0,0,0] },  // kick
    { pitch: 38, pattern: [0,0,1,0, 0,0,1,0] },  // snare
    { pitch: 42, pattern: [1,1,1,1, 1,1,1,1] },  // hihat
  ],
  rock: [
    { pitch: 36, pattern: [1,0,0,1, 1,0,0,0] },
    { pitch: 38, pattern: [0,0,1,0, 0,0,1,0] },
    { pitch: 42, pattern: [1,1,1,1, 1,1,1,1] },
    { pitch: 49, pattern: [1,0,0,0, 0,0,0,0] },  // crash
  ],
  jazz: [
    { pitch: 51, pattern: [1,0,1,1, 0,1,1,0] },  // ride
    { pitch: 36, pattern: [1,0,0,0, 0,0,1,0] },
    { pitch: 38, pattern: [0,0,0,0, 0,0,0,1] },
  ],
  edm: [
    { pitch: 36, pattern: [1,0,0,0, 1,0,0,0] },
    { pitch: 39, pattern: [0,0,1,0, 0,0,1,0] },  // clap
    { pitch: 42, pattern: [1,1,1,1, 1,1,1,1] },
    { pitch: 46, pattern: [0,0,0,0, 0,0,0,1] },  // open hat
  ],
  lofi: [
    { pitch: 36, pattern: [1,0,0,1, 0,0,1,0] },
    { pitch: 38, pattern: [0,0,1,0, 0,1,0,0] },
    { pitch: 42, pattern: [1,0,1,0, 1,0,1,0] },
  ],
};

function generateDrums(req: GenerationRequest): NoteData[] {
  const patterns = DRUM_PATTERNS[req.genre] || DRUM_PATTERNS.pop;
  const notes: NoteData[] = [];
  const stepDuration = TICKS_PER_8TH;

  for (let bar = 0; bar < req.bars; bar++) {
    for (const { pitch, pattern } of patterns) {
      for (let step = 0; step < pattern.length; step++) {
        if (pattern[step]) {
          const tick = bar * TICKS_PER_BAR_4_4 + step * stepDuration;
          // Random variation
          const vel = randInt(70, 110) + (step === 0 ? 10 : 0);
          notes.push({
            pitch,
            startTick: tick,
            durationTicks: stepDuration,
            velocity: Math.min(127, vel),
          });
        }
      }
    }
  }
  return notes;
}

// === Bass generation ===

function generateBass(req: GenerationRequest): NoteData[] {
  const { root, isMinor } = parseKey(req.key);
  const chords = getDiatonicChords(root, isMinor);
  const progressions = CHORD_PROGRESSIONS[req.genre] || CHORD_PROGRESSIONS.pop;
  const progression = pick(progressions);
  const notes: NoteData[] = [];
  const octave = 3;

  for (let bar = 0; bar < req.bars; bar++) {
    const chordIdx = progression[bar % progression.length];
    const rootNote = chords[chordIdx][0] + octave * 12 + 12;

    if (req.genre === 'edm' || req.genre === 'rock') {
      // 8분음표 베이스
      for (let i = 0; i < 8; i++) {
        notes.push({
          pitch: rootNote,
          startTick: bar * TICKS_PER_BAR_4_4 + i * TICKS_PER_8TH,
          durationTicks: TICKS_PER_8TH,
          velocity: randInt(80, 100),
        });
      }
    } else {
      // 2분음표 베이스 (lofi, jazz, pop)
      notes.push({
        pitch: rootNote,
        startTick: bar * TICKS_PER_BAR_4_4,
        durationTicks: TICKS_PER_BEAT * 2,
        velocity: randInt(80, 95),
      });
      notes.push({
        pitch: rootNote + (Math.random() > 0.5 ? 7 : 0), // 5도
        startTick: bar * TICKS_PER_BAR_4_4 + TICKS_PER_BEAT * 2,
        durationTicks: TICKS_PER_BEAT * 2,
        velocity: randInt(75, 90),
      });
    }
  }
  return notes;
}

// === Local AI Adapter ===

export const localAdapter: AIAdapter = {
  name: 'Local Algorithm',

  async generate(req: GenerationRequest): Promise<GenerationResult> {
    switch (req.type) {
      case 'chords':
        return { notes: generateChords(req), suggestedPreset: 'pad', trackName: 'Chords' };
      case 'melody':
        return { notes: generateMelody(req), suggestedPreset: 'piano', trackName: 'Melody' };
      case 'drums':
        return { notes: generateDrums(req), suggestedPreset: 'drumkit', trackName: 'Drums' };
      case 'bass':
        return { notes: generateBass(req), suggestedPreset: 'bass', trackName: 'Bass' };
      case 'full':
        // 전체 생성은 외부에서 각각 호출
        return { notes: [], suggestedPreset: 'piano', trackName: '' };
    }
  },
};
