import * as Tone from 'tone';
import { secondsToTick } from '@/lib/units';

let initialized = false;

/**
 * Tone.js AudioContext 초기화 (사용자 인터랙션 후 호출)
 */
export async function ensureAudioContext(): Promise<void> {
  if (initialized) return;
  await Tone.start();
  initialized = true;
}

/**
 * BPM 설정
 */
export function setBpm(bpm: number): void {
  Tone.getTransport().bpm.value = bpm;
}

/**
 * 재생 시작
 */
export function play(): void {
  Tone.getTransport().start();
}

/**
 * 재생 정지
 */
export function stop(): void {
  Tone.getTransport().pause();
}

/**
 * 위치를 처음(0)으로 이동
 */
export function goToStart(): void {
  Tone.getTransport().position = 0;
}

/**
 * 현재 재생 위치를 틱으로 반환
 */
export function getCurrentTick(bpm: number): number {
  return secondsToTick(Tone.getTransport().seconds, bpm);
}

/**
 * 특정 틱 위치로 이동
 */
export function setPositionTick(tick: number, bpm: number): void {
  const beatsPerSecond = bpm / 60;
  const ppq = 192;
  Tone.getTransport().seconds = tick / (beatsPerSecond * ppq);
}

/**
 * Transport 상태 확인
 */
export function isTransportStarted(): boolean {
  return Tone.getTransport().state === 'started';
}
