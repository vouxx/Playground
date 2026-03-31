import type { MidiNote, Region, Track } from '@/types/daw';
import { PPQ } from '@/types/daw';

/**
 * 프로젝트 데이터 → Standard MIDI File (Type 1) Blob
 */
export function encodeMidi(
  tracks: Track[],
  regions: Region[],
  notes: MidiNote[],
  bpm: number,
  timeSignature: [number, number],
): Blob {
  const chunks: Uint8Array[] = [];

  // Header chunk
  chunks.push(createHeaderChunk(tracks.length));

  // One track per DAW track
  for (const track of tracks) {
    if (track.type === 'audio' || track.type === 'return') continue;
    const trackRegions = regions.filter((r) => r.trackId === track.id);
    const trackNotes: { pitch: number; startTick: number; durationTicks: number; velocity: number }[] = [];

    for (const region of trackRegions) {
      const regionNotes = notes
        .filter((n) => n.regionId === region.id)
        .map((n) => ({
          pitch: n.pitch,
          startTick: region.startTick + n.startTick,
          durationTicks: n.durationTicks,
          velocity: n.velocity,
        }));
      trackNotes.push(...regionNotes);
    }

    trackNotes.sort((a, b) => a.startTick - b.startTick);
    chunks.push(createTrackChunk(track.name, trackNotes, bpm, timeSignature));
  }

  const totalSize = chunks.reduce((sum, c) => sum + c.length, 0);
  const result = new Uint8Array(totalSize);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return new Blob([result], { type: 'audio/midi' });
}

function createHeaderChunk(numTracks: number): Uint8Array {
  const data = new Uint8Array(14);
  const view = new DataView(data.buffer);
  // "MThd"
  data[0] = 0x4D; data[1] = 0x54; data[2] = 0x68; data[3] = 0x64;
  view.setUint32(4, 6); // chunk size
  view.setUint16(8, 1); // format type 1
  view.setUint16(10, numTracks);
  view.setUint16(12, PPQ); // ticks per quarter
  return data;
}

function createTrackChunk(
  name: string,
  notes: { pitch: number; startTick: number; durationTicks: number; velocity: number }[],
  bpm: number,
  timeSignature: [number, number],
): Uint8Array {
  const events: number[] = [];

  // Track name
  addMetaEvent(events, 0, 0x03, stringToBytes(name));

  // Tempo (first track)
  const microsecondsPerBeat = Math.round(60_000_000 / bpm);
  addMetaEvent(events, 0, 0x51, [
    (microsecondsPerBeat >> 16) & 0xFF,
    (microsecondsPerBeat >> 8) & 0xFF,
    microsecondsPerBeat & 0xFF,
  ]);

  // Time signature
  const denomPower = Math.log2(timeSignature[1]);
  addMetaEvent(events, 0, 0x58, [timeSignature[0], denomPower, 24, 8]);

  // Note events
  let lastTick = 0;
  const allEvents: { tick: number; data: number[] }[] = [];

  for (const note of notes) {
    allEvents.push({
      tick: note.startTick,
      data: [0x90, note.pitch, note.velocity],
    });
    allEvents.push({
      tick: note.startTick + note.durationTicks,
      data: [0x80, note.pitch, 0],
    });
  }

  allEvents.sort((a, b) => a.tick - b.tick);

  for (const event of allEvents) {
    const delta = event.tick - lastTick;
    writeVarLen(events, delta);
    events.push(...event.data);
    lastTick = event.tick;
  }

  // End of track
  addMetaEvent(events, 0, 0x2F, []);

  const trackData = new Uint8Array(events);
  const chunk = new Uint8Array(8 + trackData.length);
  const view = new DataView(chunk.buffer);
  // "MTrk"
  chunk[0] = 0x4D; chunk[1] = 0x54; chunk[2] = 0x72; chunk[3] = 0x6B;
  view.setUint32(4, trackData.length);
  chunk.set(trackData, 8);
  return chunk;
}

function addMetaEvent(events: number[], delta: number, type: number, data: number[]): void {
  writeVarLen(events, delta);
  events.push(0xFF, type);
  writeVarLen(events, data.length);
  events.push(...data);
}

function writeVarLen(events: number[], value: number): void {
  if (value < 0) value = 0;
  const bytes: number[] = [];
  bytes.push(value & 0x7F);
  value >>= 7;
  while (value > 0) {
    bytes.push((value & 0x7F) | 0x80);
    value >>= 7;
  }
  bytes.reverse();
  events.push(...bytes);
}

function stringToBytes(str: string): number[] {
  return Array.from(str).map((c) => c.charCodeAt(0));
}
