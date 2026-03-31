import * as Tone from 'tone';

interface SendNode {
  gain: Tone.Gain;
}

const sendNodes = new Map<string, SendNode>(); // key: "sourceTrackId:returnTrackId"

/**
 * 센드 연결 생성/업데이트
 */
export function createSend(
  sourceTrackId: string,
  returnTrackId: string,
  sourceGain: Tone.Gain,
  returnGain: Tone.Gain,
  level: number,
): void {
  const key = `${sourceTrackId}:${returnTrackId}`;

  let send = sendNodes.get(key);
  if (!send) {
    const gain = new Tone.Gain(level);
    sourceGain.connect(gain);
    gain.connect(returnGain);
    send = { gain };
    sendNodes.set(key, send);
  } else {
    send.gain.gain.value = level;
  }
}

/**
 * 센드 레벨 업데이트
 */
export function setSendLevel(
  sourceTrackId: string,
  returnTrackId: string,
  level: number,
): void {
  const key = `${sourceTrackId}:${returnTrackId}`;
  const send = sendNodes.get(key);
  if (send) {
    send.gain.gain.value = level;
  }
}

/**
 * 센드 연결 해제
 */
export function removeSend(sourceTrackId: string, returnTrackId: string): void {
  const key = `${sourceTrackId}:${returnTrackId}`;
  const send = sendNodes.get(key);
  if (send) {
    send.gain.disconnect();
    send.gain.dispose();
    sendNodes.delete(key);
  }
}

/**
 * 모든 센드 해제
 */
export function disposeAllSends(): void {
  for (const send of sendNodes.values()) {
    send.gain.disconnect();
    send.gain.dispose();
  }
  sendNodes.clear();
}
