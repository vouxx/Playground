/**
 * AudioBuffer에서 지정 개수의 peak 값을 추출한다.
 * 파형 렌더링에 사용.
 */
export function extractPeaks(
  buffer: AudioBuffer,
  numPeaks: number,
  channel: number = 0,
): Float32Array {
  const data = buffer.getChannelData(channel);
  const peaks = new Float32Array(numPeaks);
  const samplesPerPeak = Math.floor(data.length / numPeaks);

  if (samplesPerPeak === 0) return peaks;

  for (let i = 0; i < numPeaks; i++) {
    let max = 0;
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, data.length);
    for (let j = start; j < end; j++) {
      const abs = Math.abs(data[j]);
      if (abs > max) max = abs;
    }
    peaks[i] = max;
  }

  return peaks;
}
