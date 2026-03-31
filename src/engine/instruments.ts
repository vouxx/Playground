import * as Tone from 'tone';

type SynthInstance = Tone.PolySynth | Tone.MonoSynth;

const synthInstances = new Map<string, SynthInstance>();

/**
 * 프리셋 ID에 맞는 Tone.js 신스 생성
 */
function createSynth(presetId: string): SynthInstance {
  switch (presetId) {
    case 'piano':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.005, decay: 0.3, sustain: 0.2, release: 0.8 },
      });
    case 'pad':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.4, decay: 0.5, sustain: 0.6, release: 2 },
      });
    case 'bass':
      return new Tone.MonoSynth({
        oscillator: { type: 'sawtooth' },
        filter: { Q: 2, type: 'lowpass', frequency: 800 },
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.4, release: 0.3 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2, baseFrequency: 200, octaves: 2 },
      });
    case 'lead':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'square' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.4 },
      });
    case 'strings':
      return new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.3, decay: 0.4, sustain: 0.7, release: 1.5 },
      });
    case 'fm':
      return new Tone.PolySynth(Tone.FMSynth, {
        modulationIndex: 12,
        envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
      });
    default:
      return new Tone.PolySynth(Tone.Synth);
  }
}

/**
 * 트랙용 신스 가져오기 (없으면 생성)
 */
export function getSynth(trackId: string, presetId: string): SynthInstance {
  const key = `${trackId}:${presetId}`;
  if (synthInstances.has(key)) return synthInstances.get(key)!;

  // 기존 신스가 다른 프리셋이면 해제
  for (const [k, synth] of synthInstances) {
    if (k.startsWith(`${trackId}:`)) {
      synth.dispose();
      synthInstances.delete(k);
    }
  }

  const synth = createSynth(presetId);
  synthInstances.set(key, synth);
  return synth;
}

/**
 * 트랙 신스를 mixer 채널에 연결
 */
export function connectSynthToChannel(
  trackId: string,
  presetId: string,
  destination: Tone.Gain,
): SynthInstance {
  const synth = getSynth(trackId, presetId);
  synth.disconnect();
  synth.connect(destination);
  return synth;
}

/**
 * 트랙 신스 해제
 */
export function disposeSynth(trackId: string): void {
  for (const [k, synth] of synthInstances) {
    if (k.startsWith(`${trackId}:`)) {
      synth.dispose();
      synthInstances.delete(k);
    }
  }
}

/**
 * 모든 신스 해제
 */
export function disposeAllSynths(): void {
  for (const synth of synthInstances.values()) {
    synth.dispose();
  }
  synthInstances.clear();
}
