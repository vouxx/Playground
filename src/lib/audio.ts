import * as Tone from 'tone';
import type { DrumType } from '@/types';

let initialized = false;

const synths: Record<string, Tone.MembraneSynth | Tone.NoiseSynth | Tone.MetalSynth> = {};
const volumes: Record<string, Tone.Volume> = {};

function createMetalSynth(
  opts: { envelope: Partial<Tone.EnvelopeOptions>; harmonicity: number; modulationIndex: number; octaves: number },
): Tone.MetalSynth {
  const synth = new Tone.MetalSynth({
    envelope: opts.envelope,
    harmonicity: opts.harmonicity,
    modulationIndex: opts.modulationIndex,
    octaves: opts.octaves,
  });
  return synth;
}

function createDrumKit() {
  if (initialized) return;

  // Kick — deep membrane hit
  volumes.kick = new Tone.Volume(0).toDestination();
  synths.kick = new Tone.MembraneSynth({
    pitchDecay: 0.05,
    octaves: 6,
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.1 },
  }).connect(volumes.kick);

  // Snare — noise burst
  volumes.snare = new Tone.Volume(0).toDestination();
  synths.snare = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
  }).connect(volumes.snare);

  // Hi-hat — short metallic
  volumes.hihat = new Tone.Volume(-6).toDestination();
  synths.hihat = createMetalSynth({
    envelope: { attack: 0.001, decay: 0.05, release: 0.01 },
    harmonicity: 5.1,
    modulationIndex: 32,
    octaves: 1.5,
  }).connect(volumes.hihat);

  // Open Hat — longer metallic
  volumes.openhat = new Tone.Volume(-6).toDestination();
  synths.openhat = createMetalSynth({
    envelope: { attack: 0.001, decay: 0.3, release: 0.1 },
    harmonicity: 5.1,
    modulationIndex: 32,
    octaves: 1.5,
  }).connect(volumes.openhat);

  // Clap — shaped noise
  volumes.clap = new Tone.Volume(0).toDestination();
  synths.clap = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.05 },
  }).connect(volumes.clap);

  // Rim — high pitched membrane
  volumes.rim = new Tone.Volume(-3).toDestination();
  synths.rim = new Tone.MembraneSynth({
    pitchDecay: 0.008,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
  }).connect(volumes.rim);

  // Tom — mid membrane
  volumes.tom = new Tone.Volume(0).toDestination();
  synths.tom = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.1 },
  }).connect(volumes.tom);

  // Cymbal — long metallic sustain
  volumes.cymbal = new Tone.Volume(-8).toDestination();
  synths.cymbal = createMetalSynth({
    envelope: { attack: 0.001, decay: 0.8, release: 0.3 },
    harmonicity: 5.1,
    modulationIndex: 40,
    octaves: 1.5,
  }).connect(volumes.cymbal);

  initialized = true;
}

const TRIGGER_NOTES: Partial<Record<DrumType, string>> = {
  kick: 'C1',
  rim: 'G3',
  tom: 'E2',
};

export function triggerDrum(drum: DrumType, time: number) {
  const synth = synths[drum];
  if (!synth) return;

  if (synth instanceof Tone.NoiseSynth) {
    synth.triggerAttackRelease('16n', time);
  } else if (synth instanceof Tone.MetalSynth) {
    synth.triggerAttackRelease('16n', time);
  } else {
    synth.triggerAttackRelease(TRIGGER_NOTES[drum] ?? 'C2', '16n', time);
  }
}

export function setTrackVolume(drum: DrumType, volumeDb: number) {
  const vol = volumes[drum];
  if (vol) vol.volume.value = volumeDb;
}

export function setTrackMute(drum: DrumType, muted: boolean) {
  const vol = volumes[drum];
  if (vol) vol.mute = muted;
}

export async function initAudio() {
  await Tone.start();
  createDrumKit();
}

export function getTransport() {
  return Tone.getTransport();
}
