import * as Tone from 'tone';
import type { SynthPreset } from '@/types';

let polySynth: Tone.PolySynth | null = null;
let synthVolume: Tone.Volume | null = null;
let currentPreset: SynthPreset = 'sine';

function createSynth(preset: SynthPreset): Tone.PolySynth {
  return new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: preset },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.4 },
  });
}

export function initSynth() {
  if (polySynth) return;
  synthVolume = new Tone.Volume(-6).toDestination();
  polySynth = createSynth(currentPreset).connect(synthVolume);
}

export function setSynthPreset(preset: SynthPreset) {
  if (currentPreset === preset) return;
  currentPreset = preset;

  if (polySynth && synthVolume) {
    polySynth.dispose();
    polySynth = createSynth(preset).connect(synthVolume);
  }
}

export function triggerNotes(notes: string[], time: number) {
  if (!polySynth) return;
  polySynth.triggerAttackRelease(notes, '16n', time);
}

export function setSynthVolume(db: number) {
  if (synthVolume) synthVolume.volume.value = db;
}

export function setSynthMute(muted: boolean) {
  if (synthVolume) synthVolume.mute = muted;
}
