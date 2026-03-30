import * as Tone from 'tone';

export interface EffectState {
  reverb: number;
  delay: number;
  distortion: number;
  filter: number;
}

let reverbNode: Tone.Reverb | null = null;
let delayNode: Tone.FeedbackDelay | null = null;
let distortionNode: Tone.Distortion | null = null;
let filterNode: Tone.Filter | null = null;
let effectsInitialized = false;

export function initEffects() {
  if (effectsInitialized) return;

  filterNode = new Tone.Filter(20000, 'lowpass').toDestination();
  distortionNode = new Tone.Distortion(0).connect(filterNode);
  delayNode = new Tone.FeedbackDelay('8n', 0).connect(distortionNode);
  reverbNode = new Tone.Reverb({ decay: 1.5, wet: 0 }).connect(delayNode);

  effectsInitialized = true;
}

export function getEffectsInput(): Tone.ToneAudioNode {
  return reverbNode ?? Tone.getDestination();
}

export function setReverb(wet: number) {
  if (reverbNode) reverbNode.wet.value = wet / 100;
}

export function setDelay(wet: number) {
  if (delayNode) delayNode.wet.value = wet / 100;
}

export function setDistortion(amount: number) {
  if (distortionNode) distortionNode.distortion = amount / 100;
}

export function setFilter(frequency: number) {
  if (filterNode) filterNode.frequency.value = 200 + (frequency / 100) * 19800;
}

export function updateEffects(state: EffectState) {
  setReverb(state.reverb);
  setDelay(state.delay);
  setDistortion(state.distortion);
  setFilter(state.filter);
}
