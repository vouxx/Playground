import * as Tone from 'tone';
import type { MidiNote, Region } from '@/types/daw';
import { tickToSeconds } from '@/lib/units';
import { pitchToName, velocityToGain } from '@/lib/midi';
import { triggerDrum } from './drumkit';

type SynthLike = {
  triggerAttackRelease: (
    note: string | string[],
    duration: string | number,
    time?: number,
    velocity?: number,
  ) => void;
};

const scheduledIds: number[] = [];

/**
 * 모든 트랙의 MIDI 노트를 Tone.Transport에 스케줄링
 */
export function scheduleAllNotes(
  tracks: Array<{
    trackId: string;
    instrumentId: string;
    type: 'midi' | 'drum';
    regions: Region[];
    notes: MidiNote[];
    synth: SynthLike | null;
  }>,
  bpm: number,
): void {
  clearSchedule();

  for (const track of tracks) {
    for (const region of track.regions) {
      const regionNotes = track.notes.filter((n) => n.regionId === region.id);

      for (const note of regionNotes) {
        const absoluteTick = region.startTick + note.startTick;
        const startTime = tickToSeconds(absoluteTick, bpm);
        const duration = tickToSeconds(note.durationTicks, bpm);
        const velocity = velocityToGain(note.velocity);

        const id = Tone.getTransport().scheduleOnce((time) => {
          if (track.type === 'drum') {
            triggerDrum(note.pitch, time, velocity);
          } else if (track.synth) {
            const noteName = pitchToName(note.pitch);
            track.synth.triggerAttackRelease(noteName, duration, time, velocity);
          }
        }, startTime);

        scheduledIds.push(id);
      }
    }
  }
}

/**
 * 스케줄 전부 해제
 */
export function clearSchedule(): void {
  const transport = Tone.getTransport();
  for (const id of scheduledIds) {
    transport.clear(id);
  }
  scheduledIds.length = 0;
}
