import * as Tone from 'tone';

interface ChannelNodes {
  gain: Tone.Gain;
  panner: Tone.Panner;
}

const channels = new Map<string, ChannelNodes>();

/**
 * 트랙용 채널 노드(Gain + Panner) 생성 및 연결
 */
export function createChannel(trackId: string): ChannelNodes {
  if (channels.has(trackId)) return channels.get(trackId)!;

  const gain = new Tone.Gain(1);
  const panner = new Tone.Panner(0);
  gain.connect(panner);
  panner.toDestination();

  const channel = { gain, panner };
  channels.set(trackId, channel);
  return channel;
}

/**
 * 트랙 채널 볼륨 설정 (dB)
 */
export function setChannelVolume(trackId: string, volumeDb: number): void {
  const ch = channels.get(trackId);
  if (!ch) return;
  // dB → 선형 변환
  if (volumeDb === -Infinity || volumeDb <= -60) {
    ch.gain.gain.value = 0;
  } else {
    ch.gain.gain.value = Math.pow(10, volumeDb / 20);
  }
}

/**
 * 트랙 채널 팬 설정 (-1 ~ +1)
 */
export function setChannelPan(trackId: string, pan: number): void {
  const ch = channels.get(trackId);
  if (!ch) return;
  ch.panner.pan.value = pan;
}

/**
 * 트랙 채널 뮤트 (gain → 0)
 */
export function muteChannel(trackId: string, muted: boolean): void {
  const ch = channels.get(trackId);
  if (!ch) return;
  if (muted) {
    ch.gain.gain.value = 0;
  }
  // unmute 시 setChannelVolume을 다시 호출해야 함
}

/**
 * 솔로 로직 적용: 솔로된 트랙만 활성, 나머지 뮤트
 * 솔로가 없으면 개별 뮤트 상태 복원
 */
export function applySoloState(
  trackStates: Array<{ id: string; volume: number; mute: boolean; solo: boolean }>,
): void {
  const hasSolo = trackStates.some((t) => t.solo);

  for (const t of trackStates) {
    if (hasSolo) {
      if (t.solo) {
        setChannelVolume(t.id, t.volume);
      } else {
        muteChannel(t.id, true);
      }
    } else {
      if (t.mute) {
        muteChannel(t.id, true);
      } else {
        setChannelVolume(t.id, t.volume);
      }
    }
    setChannelPan(t.id, 0); // pan은 별도 호출
  }
}

/**
 * 채널 노드 해제
 */
export function removeChannel(trackId: string): void {
  const ch = channels.get(trackId);
  if (!ch) return;
  ch.gain.disconnect();
  ch.panner.disconnect();
  ch.gain.dispose();
  ch.panner.dispose();
  channels.delete(trackId);
}

/**
 * 모든 채널 해제
 */
export function disposeAllChannels(): void {
  for (const trackId of channels.keys()) {
    removeChannel(trackId);
  }
}
