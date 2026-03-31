import * as Tone from 'tone';

let highClick: Tone.Synth | null = null;
let lowClick: Tone.Synth | null = null;
let loopId: number | null = null;
let enabled = true;

/**
 * 메트로놈 신스 초기화
 */
function ensureSynths(): void {
  if (highClick) return;
  highClick = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.01 },
    volume: -10,
  }).toDestination();

  lowClick = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.08, sustain: 0, release: 0.01 },
    volume: -14,
  }).toDestination();
}

/**
 * 메트로놈 스케줄링 시작
 */
export function startMetronome(beatsPerBar: number = 4): void {
  stopMetronome();
  ensureSynths();

  let beatIndex = 0;

  loopId = Tone.getTransport().scheduleRepeat(
    (time) => {
      if (!enabled) return;
      if (beatIndex % beatsPerBar === 0) {
        highClick?.triggerAttackRelease('C6', '32n', time);
      } else {
        lowClick?.triggerAttackRelease('C5', '32n', time);
      }
      beatIndex++;
    },
    '4n',
    0,
  );
}

/**
 * 메트로놈 스케줄링 정지
 */
export function stopMetronome(): void {
  if (loopId !== null) {
    Tone.getTransport().clear(loopId);
    loopId = null;
  }
}

/**
 * 메트로놈 활성화/비활성화
 */
export function setMetronomeEnabled(on: boolean): void {
  enabled = on;
}

/**
 * 메트로놈 리소스 해제
 */
export function disposeMetronome(): void {
  stopMetronome();
  highClick?.dispose();
  lowClick?.dispose();
  highClick = null;
  lowClick = null;
}
