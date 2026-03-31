import * as Tone from 'tone';
import { encodeWav } from './wavEncoder';
import { downloadBlob } from './projectSerializer';

/**
 * 프로젝트를 오프라인 렌더링하여 WAV로 다운로드
 * 콜백으로 프로그레스(0~1) 전달
 */
export async function bounceToWav(
  durationSeconds: number,
  setupCallback: () => void,
  projectName: string,
  onProgress?: (progress: number) => void,
): Promise<void> {
  onProgress?.(0);

  const buffer = await Tone.Offline(({ transport }) => {
    setupCallback();
    transport.start();
  }, durationSeconds);

  onProgress?.(0.8);

  const audioBuffer = (buffer as unknown as { _buffer: AudioBuffer })._buffer ?? buffer.get() as unknown as AudioBuffer;
  const wavBlob = encodeWav(audioBuffer);
  onProgress?.(0.95);

  downloadBlob(wavBlob, `${projectName}.wav`);
  onProgress?.(1);
}
