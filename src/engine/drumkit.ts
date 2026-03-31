import * as Tone from 'tone';
import type { DrumPadMapping } from '@/types/daw';

export const DRUM_PAD_MAPPINGS: DrumPadMapping[] = [
  { padIndex: 0,  name: 'Kick',      pitch: 36, keyTrigger: 'z' },
  { padIndex: 1,  name: 'Snare',     pitch: 38, keyTrigger: 'x' },
  { padIndex: 2,  name: 'Clap',      pitch: 39, keyTrigger: 'c' },
  { padIndex: 3,  name: 'HiHat C',   pitch: 42, keyTrigger: 'v' },
  { padIndex: 4,  name: 'HiHat O',   pitch: 46, keyTrigger: 'a' },
  { padIndex: 5,  name: 'Tom Hi',    pitch: 50, keyTrigger: 's' },
  { padIndex: 6,  name: 'Tom Mid',   pitch: 47, keyTrigger: 'd' },
  { padIndex: 7,  name: 'Tom Low',   pitch: 45, keyTrigger: 'f' },
  { padIndex: 8,  name: 'Crash',     pitch: 49, keyTrigger: 'q' },
  { padIndex: 9,  name: 'Ride',      pitch: 51, keyTrigger: 'w' },
  { padIndex: 10, name: 'Rim',       pitch: 37, keyTrigger: 'e' },
  { padIndex: 11, name: 'Cowbell',   pitch: 56, keyTrigger: 'r' },
  { padIndex: 12, name: 'Perc 1',    pitch: 60, keyTrigger: '1' },
  { padIndex: 13, name: 'Perc 2',    pitch: 61, keyTrigger: '2' },
  { padIndex: 14, name: 'Perc 3',    pitch: 62, keyTrigger: '3' },
  { padIndex: 15, name: 'Perc 4',    pitch: 63, keyTrigger: '4' },
];

interface DrumVoice {
  trigger: (time?: number | undefined, velocity?: number) => void;
  dispose: () => void;
}

const drumVoices = new Map<number, DrumVoice>();
let destination: Tone.Gain | null = null;

function createKick(dest: Tone.Gain): DrumVoice {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.05, octaves: 6, envelope: { attack: 0.001, decay: 0.4, sustain: 0, release: 0.2 },
  }).connect(dest);
  return {
    trigger: (time, vel = 1) => synth.triggerAttackRelease('C1', '8n', time ?? Tone.now(), vel),
    dispose: () => synth.dispose(),
  };
}

function createSnare(dest: Tone.Gain): DrumVoice {
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 },
    volume: -6,
  }).connect(dest);
  return {
    trigger: (time, vel = 1) => noise.triggerAttackRelease('16n', time ?? Tone.now(), vel),
    dispose: () => noise.dispose(),
  };
}

function createHiHat(dest: Tone.Gain, open: boolean): DrumVoice {
  const synth = new Tone.MetalSynth({
    envelope: { attack: 0.001, decay: open ? 0.3 : 0.06, release: open ? 0.2 : 0.02 },
    harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5, volume: -10,
  }).connect(dest);
  return {
    trigger: (time, vel = 1) => synth.triggerAttackRelease('32n', time ?? Tone.now(), vel),
    dispose: () => synth.dispose(),
  };
}

function createGenericPerc(dest: Tone.Gain, freq: number): DrumVoice {
  const synth = new Tone.MembraneSynth({
    pitchDecay: 0.03, octaves: 4,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
  }).connect(dest);
  const note = Tone.Frequency(freq, 'midi').toNote();
  return {
    trigger: (time, vel = 1) => synth.triggerAttackRelease(note, '16n', time ?? Tone.now(), vel),
    dispose: () => synth.dispose(),
  };
}

/**
 * 드럼킷 초기화 (mixer 채널에 연결)
 */
export function initDrumKit(dest: Tone.Gain): void {
  disposeDrumKit();
  destination = dest;

  drumVoices.set(36, createKick(dest));
  drumVoices.set(38, createSnare(dest));
  drumVoices.set(39, createSnare(dest)); // clap as snare variant
  drumVoices.set(42, createHiHat(dest, false));
  drumVoices.set(46, createHiHat(dest, true));
  drumVoices.set(50, createGenericPerc(dest, 50));
  drumVoices.set(47, createGenericPerc(dest, 47));
  drumVoices.set(45, createGenericPerc(dest, 45));
  drumVoices.set(49, createHiHat(dest, true)); // crash
  drumVoices.set(51, createHiHat(dest, true)); // ride
  drumVoices.set(37, createSnare(dest));       // rim
  drumVoices.set(56, createGenericPerc(dest, 56)); // cowbell

  // Generic percs
  for (let i = 60; i <= 63; i++) {
    drumVoices.set(i, createGenericPerc(dest, i));
  }
}

/**
 * 드럼킷이 초기화되지 않았으면 기본 destination으로 초기화
 */
export function ensureDrumKit(): void {
  if (drumVoices.size > 0) return;
  const dest = new Tone.Gain(1).toDestination();
  initDrumKit(dest);
}

/**
 * 드럼 트리거 (초기화 안 되어 있으면 자동 초기화)
 */
export function triggerDrum(pitch: number, time?: number, velocity: number = 1): void {
  ensureDrumKit();
  const voice = drumVoices.get(pitch);
  if (voice) voice.trigger(time, velocity);
}

/**
 * 드럼킷 해제
 */
export function disposeDrumKit(): void {
  for (const voice of drumVoices.values()) voice.dispose();
  drumVoices.clear();
  destination = null;
}
