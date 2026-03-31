import * as Tone from 'tone';
import type { AudioRegionData } from '@/types/daw';

const players = new Map<string, Tone.Player>();
const scheduledIds: number[] = [];

/**
 * 오디오 리전을 Transport에 스케줄링
 */
export function scheduleAudioRegion(
  regionId: string,
  buffer: AudioBuffer,
  data: AudioRegionData,
  regionStartSeconds: number,
  destination: Tone.Gain,
): void {
  const toneBuffer = new Tone.ToneAudioBuffer(buffer);
  const player = new Tone.Player(toneBuffer).connect(destination);

  // 페이드 인/아웃 설정
  player.fadeIn = data.fadeInDuration;
  player.fadeOut = data.fadeOutDuration;

  players.set(regionId, player);

  const id = Tone.getTransport().scheduleOnce((time) => {
    player.start(time, data.offset, data.playDuration);
  }, regionStartSeconds);

  scheduledIds.push(id);
}

/**
 * 모든 오디오 스케줄 해제
 */
export function clearAudioSchedule(): void {
  const transport = Tone.getTransport();
  for (const id of scheduledIds) {
    transport.clear(id);
  }
  scheduledIds.length = 0;

  for (const player of players.values()) {
    player.stop();
    player.dispose();
  }
  players.clear();
}
