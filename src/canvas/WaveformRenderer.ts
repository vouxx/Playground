import { extractPeaks } from '@/lib/waveform';

const WAVEFORM_COLOR = 'rgba(59, 130, 246, 0.6)'; // blue-500
const WAVEFORM_CACHE = new Map<string, Float32Array>();

/**
 * 리전 영역 내부에 파형을 Canvas로 렌더링
 */
export function renderWaveform(
  ctx: CanvasRenderingContext2D,
  buffer: AudioBuffer,
  bufferId: string,
  x: number,
  y: number,
  width: number,
  height: number,
): void {
  if (width <= 0 || height <= 0) return;

  const numPeaks = Math.max(1, Math.floor(width));
  const cacheKey = `${bufferId}:${numPeaks}`;

  let peaks = WAVEFORM_CACHE.get(cacheKey);
  if (!peaks) {
    peaks = extractPeaks(buffer, numPeaks);
    WAVEFORM_CACHE.set(cacheKey, peaks);
    // 캐시 크기 제한
    if (WAVEFORM_CACHE.size > 200) {
      const firstKey = WAVEFORM_CACHE.keys().next().value;
      if (firstKey) WAVEFORM_CACHE.delete(firstKey);
    }
  }

  const midY = y + height / 2;
  ctx.fillStyle = WAVEFORM_COLOR;

  for (let i = 0; i < peaks.length; i++) {
    const peakH = peaks[i] * height * 0.9;
    ctx.fillRect(x + i, midY - peakH / 2, 1, peakH || 0.5);
  }
}

/**
 * 캐시 클리어
 */
export function clearWaveformCache(): void {
  WAVEFORM_CACHE.clear();
}
