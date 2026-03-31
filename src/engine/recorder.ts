import * as Tone from 'tone';

let mediaStream: MediaStream | null = null;
let mediaRecorder: MediaRecorder | null = null;
let chunks: Blob[] = [];
let resolveRecording: ((buffer: AudioBuffer) => void) | null = null;

/**
 * 마이크 권한 요청 및 MediaStream 획득
 */
export async function requestMicAccess(): Promise<MediaStream> {
  if (mediaStream) return mediaStream;
  mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  return mediaStream;
}

/**
 * 녹음 시작 — Promise로 AudioBuffer 반환 (stopRecording 시 resolve)
 */
export function startRecording(): Promise<AudioBuffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const stream = await requestMicAccess();
      chunks = [];
      resolveRecording = resolve;

      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const arrayBuffer = await blob.arrayBuffer();
        const audioCtx = Tone.getContext().rawContext;
        const audioBuffer = await (audioCtx as unknown as AudioContext).decodeAudioData(arrayBuffer);
        if (resolveRecording) resolveRecording(audioBuffer);
        resolveRecording = null;
      };
      mediaRecorder.start();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 녹음 정지
 */
export function stopRecording(): void {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
  }
}

/**
 * 리소스 해제
 */
export function disposeRecorder(): void {
  stopRecording();
  if (mediaStream) {
    mediaStream.getTracks().forEach((t) => t.stop());
    mediaStream = null;
  }
  mediaRecorder = null;
  chunks = [];
}
