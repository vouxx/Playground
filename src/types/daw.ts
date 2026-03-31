// === Core Types for DAW ===

export type TrackType = 'midi' | 'drum' | 'audio' | 'return';

export interface MixerState {
  volume: number;   // dB, -Infinity ~ +6
  pan: number;      // -1.0 (L) ~ +1.0 (R)
  mute: boolean;
  solo: boolean;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: string;
  mixer: MixerState;
  instrumentId: string;
}

export interface Region {
  id: string;
  trackId: string;
  startTick: number;
  durationTicks: number;
  name: string;
}

export interface AudioRegionData {
  bufferId: string;          // AudioBuffer 참조 ID
  offset: number;            // 원본 내 시작점 (초)
  playDuration: number;      // 재생 길이 (초)
  fadeInDuration: number;    // 페이드 인 (초)
  fadeOutDuration: number;   // 페이드 아웃 (초)
}

export interface Project {
  id: string;
  name: string;
  bpm: number;
  timeSignature: [number, number];
  trackOrder: string[];
}

// === Constants ===

/** Pulses Per Quarter note (Tone.js default) */
export const PPQ = 192;

/** Default region duration: 4 bars in 4/4 = 4 * 4 * PPQ */
export const DEFAULT_REGION_DURATION = 4 * 4 * PPQ;

/** BPM limits */
export const MIN_BPM = 20;
export const MAX_BPM = 999;

/** Volume limits (dB) */
export const MIN_VOLUME_DB = -60;
export const MAX_VOLUME_DB = 6;

// === Effects & Automation Types ===

export type EffectType = 'eq3' | 'compressor' | 'reverb' | 'delay' | 'chorus' | 'distortion';

export interface EffectInstance {
  id: string;
  type: EffectType;
  params: Record<string, number>;
  bypass: boolean;
}

export interface SendConfig {
  returnTrackId: string;
  level: number; // 0~1
}

export interface AutomationPoint {
  tick: number;
  value: number; // 0~1 normalized
}

export interface AutomationLane {
  id: string;
  trackId: string;
  parameterKey: string; // e.g. "volume", "pan", "effect:reverb:decay"
  points: AutomationPoint[];
}

/** Zoom limits (pixels per tick) */
export const MIN_PIXELS_PER_TICK = 0.02;
export const MAX_PIXELS_PER_TICK = 2.0;
export const DEFAULT_PIXELS_PER_TICK = 0.15;

// === MIDI Types ===

export interface MidiNote {
  id: string;
  regionId: string;
  pitch: number;       // 0~127, 60=C4
  startTick: number;   // relative to region start
  durationTicks: number;
  velocity: number;    // 1~127
}

export type InstrumentType = 'synth' | 'drumkit';

export interface InstrumentPreset {
  id: string;
  name: string;
  type: InstrumentType;
  category: string;
}

export interface DrumPadMapping {
  padIndex: number;
  name: string;
  pitch: number;
  keyTrigger: string;
}

/** Track color palette */
export const TRACK_COLORS = [
  '#3B82F6', // blue
  '#EF4444', // red
  '#10B981', // emerald
  '#F59E0B', // amber
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#6366F1', // indigo
  '#14B8A6', // teal
] as const;
