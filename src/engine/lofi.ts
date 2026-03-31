import * as Tone from 'tone';
import { ensureAudioContext } from './transport';

// ── 타입 ──────────────────────────────────────────────
export type LofiMood = 'chill' | 'jazzy' | 'rainy';

interface LofiNodes {
  master: Tone.Gain;
  filter: Tone.Filter;
  reverb: Tone.Reverb;
  crusher: Tone.BitCrusher;
  chordSynth: Tone.PolySynth;
  bassSynth: Tone.MonoSynth;
  kick: Tone.MembraneSynth;
  hat: Tone.NoiseSynth;
  snare: Tone.NoiseSynth;
  crackle: Tone.Noise;
  crackleGain: Tone.Gain;
  drumLoop: Tone.Loop | null;
  chordLoop: Tone.Loop | null;
  bassLoop: Tone.Loop | null;
}

// ── 코드 프로그레션 ──────────────────────────────────
const PROGRESSIONS: Record<LofiMood, string[][]> = {
  chill: [
    ['Dm7', 'G7', 'Cmaj7', 'Am7'],
    ['Fmaj7', 'Em7', 'Dm7', 'G7'],
  ],
  jazzy: [
    ['Dm9', 'G13', 'Cmaj9', 'A7b9'],
    ['Fmaj7', 'Bb7', 'Em7', 'A7'],
  ],
  rainy: [
    ['Am7', 'Dm7', 'G7', 'Cmaj7'],
    ['Fmaj7', 'Bm7b5', 'E7', 'Am7'],
  ],
};

const CHORD_NOTES: Record<string, string[]> = {
  Cmaj7: ['C3', 'E3', 'G3', 'B3'],
  Cmaj9: ['C3', 'E3', 'G3', 'B3', 'D4'],
  Dm7: ['D3', 'F3', 'A3', 'C4'],
  Dm9: ['D3', 'F3', 'A3', 'C4', 'E4'],
  Em7: ['E3', 'G3', 'B3', 'D4'],
  Fmaj7: ['F3', 'A3', 'C4', 'E4'],
  G7: ['G2', 'B2', 'D3', 'F3'],
  G13: ['G2', 'B2', 'D3', 'F3', 'E3'],
  Am7: ['A2', 'C3', 'E3', 'G3'],
  A7: ['A2', 'C#3', 'E3', 'G3'],
  'A7b9': ['A2', 'C#3', 'E3', 'G3', 'Bb3'],
  Bb7: ['Bb2', 'D3', 'F3', 'Ab3'],
  'Bm7b5': ['B2', 'D3', 'F3', 'A3'],
  E7: ['E3', 'G#3', 'B3', 'D4'],
};

// ── 드럼 패턴 (16th note grid, 1=hit) ────────────────
const DRUM_PATTERNS: Record<LofiMood, { kick: number[]; hat: number[]; snare: number[] }> = {
  chill: {
    kick:  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
  jazzy: {
    kick:  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1],
  },
  rainy: {
    kick:  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
    hat:   [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0],
    snare: [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  },
};

// ── 베이스 패턴 (코드 루트 기반) ──────────────────────
const BASS_ROOTS: Record<string, string> = {
  Cmaj7: 'C2', Cmaj9: 'C2', Dm7: 'D2', Dm9: 'D2',
  Em7: 'E2', Fmaj7: 'F2', G7: 'G1', G13: 'G1',
  Am7: 'A1', A7: 'A1', 'A7b9': 'A1', Bb7: 'Bb1',
  'Bm7b5': 'B1', E7: 'E2',
};

// ── 싱글톤 상태 ──────────────────────────────────────
let nodes: LofiNodes | null = null;
let currentMood: LofiMood = 'chill';
let currentProgIdx = 0;
let currentChordIdx = 0;

function getSwing(): number {
  return 0.02 + Math.random() * 0.015;
}

function createNodes(): LofiNodes {
  const master = new Tone.Gain(0.7).toDestination();
  const reverb = new Tone.Reverb({ decay: 3, wet: 0.4 }).connect(master);
  const crusher = new Tone.BitCrusher({ bits: 12 }).connect(reverb);
  const filter = new Tone.Filter({ frequency: 800, type: 'lowpass', rolloff: -24 }).connect(crusher);

  const chordSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.3, decay: 0.8, sustain: 0.4, release: 1.5 },
    volume: -14,
  }).connect(filter);

  const bassSynth = new Tone.MonoSynth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.1, decay: 0.3, sustain: 0.6, release: 0.8 },
    filterEnvelope: { attack: 0.05, decay: 0.2, sustain: 0.3, release: 0.5, baseFrequency: 200, octaves: 2 },
    volume: -10,
  }).connect(filter);

  const kick = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 6,
    envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
    volume: -8,
  }).connect(master);

  const hat = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
    volume: -18,
  }).connect(filter);

  const snare = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.12, sustain: 0, release: 0.08 },
    volume: -14,
  }).connect(filter);

  const crackleGain = new Tone.Gain(0.15).connect(master);
  const crackle = new Tone.Noise('brown').connect(
    new Tone.Filter({ frequency: 3000, type: 'lowpass' }).connect(
      new Tone.BitCrusher({ bits: 4 }).connect(crackleGain),
    ),
  );

  return {
    master, filter, reverb, crusher,
    chordSynth, bassSynth, kick, hat, snare,
    crackle, crackleGain,
    drumLoop: null, chordLoop: null, bassLoop: null,
  };
}

function advanceChord(): string[] {
  const progs = PROGRESSIONS[currentMood];
  const prog = progs[currentProgIdx % progs.length];
  const chordName = prog[currentChordIdx % prog.length];
  currentChordIdx++;
  if (currentChordIdx >= prog.length) {
    currentChordIdx = 0;
    // 랜덤하게 다음 프로그레션으로 변주
    if (Math.random() > 0.5) {
      currentProgIdx = (currentProgIdx + 1) % progs.length;
    }
  }
  return CHORD_NOTES[chordName] ?? ['C3', 'E3', 'G3'];
}

function currentChordName(): string {
  const progs = PROGRESSIONS[currentMood];
  const prog = progs[currentProgIdx % progs.length];
  return prog[currentChordIdx % prog.length];
}

function startLoops(n: LofiNodes): void {
  const pattern = DRUM_PATTERNS[currentMood];
  let step = 0;

  n.drumLoop = new Tone.Loop((time) => {
    const s = step % 16;
    const swing = s % 2 === 1 ? getSwing() : 0;
    const t = time + swing;

    if (pattern.kick[s]) n.kick.triggerAttackRelease('C1', '8n', t, 0.7 + Math.random() * 0.15);
    if (pattern.hat[s]) n.hat.triggerAttackRelease('32n', t, 0.4 + Math.random() * 0.2);
    if (pattern.snare[s]) n.snare.triggerAttackRelease('16n', t, 0.5 + Math.random() * 0.15);

    step++;
  }, '16n').start(0);

  n.chordLoop = new Tone.Loop((time) => {
    const chordNotes = advanceChord();
    const vel = 0.25 + Math.random() * 0.1;
    n.chordSynth.triggerAttackRelease(chordNotes, '2n', time, vel);
  }, '1m').start(0);

  n.bassLoop = new Tone.Loop((time) => {
    const chordName = currentChordName();
    const root = BASS_ROOTS[chordName] ?? 'C2';
    n.bassSynth.triggerAttackRelease(root, '2n', time, 0.5 + Math.random() * 0.1);
  }, '1m').start('0:0:2'); // 코드보다 약간 뒤에 시작
}

// ── Public API ───────────────────────────────────────

export async function startLofi(mood: LofiMood, bpm: number): Promise<void> {
  await ensureAudioContext();
  stopLofi();

  currentMood = mood;
  currentProgIdx = 0;
  currentChordIdx = 0;

  const transport = Tone.getTransport();
  // 로파이 전용 Transport 상태 저장은 하지 않음
  // DAW Transport와 독립적으로 동작하기 위해 자체 루프 사용
  transport.bpm.value = bpm;
  transport.swing = 0.05;
  transport.swingSubdivision = '16n';

  nodes = createNodes();
  nodes.crackle.start();
  startLoops(nodes);
  transport.start();
}

export function stopLofi(): void {
  if (!nodes) return;

  nodes.drumLoop?.stop().dispose();
  nodes.chordLoop?.stop().dispose();
  nodes.bassLoop?.stop().dispose();
  nodes.crackle.stop();

  nodes.chordSynth.dispose();
  nodes.bassSynth.dispose();
  nodes.kick.dispose();
  nodes.hat.dispose();
  nodes.snare.dispose();
  nodes.crackle.dispose();
  nodes.crackleGain.dispose();
  nodes.crusher.dispose();
  nodes.reverb.dispose();
  nodes.filter.dispose();
  nodes.master.dispose();

  Tone.getTransport().stop();
  Tone.getTransport().cancel();

  nodes = null;
}

export function setLofiMood(mood: LofiMood): void {
  currentMood = mood;
  currentProgIdx = 0;
  currentChordIdx = 0;

  if (!nodes) return;

  // 드럼 루프 재시작 (새 패턴 적용)
  nodes.drumLoop?.stop().dispose();
  nodes.chordLoop?.stop().dispose();
  nodes.bassLoop?.stop().dispose();
  startLoops(nodes);
}

export function setLofiFilterFreq(freq: number): void {
  if (nodes) nodes.filter.frequency.rampTo(freq, 0.3);
}

export function setLofiCrackle(volume: number): void {
  if (nodes) nodes.crackleGain.gain.rampTo(volume, 0.2);
}

export function setLofiVolume(volume: number): void {
  if (nodes) nodes.master.gain.rampTo(volume, 0.2);
}

export function isLofiPlaying(): boolean {
  return nodes !== null;
}
