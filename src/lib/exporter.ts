import * as Tone from 'tone';
import { useSequencerStore } from '@/store/useSequencerStore';
import { usePianoStore } from '@/store/usePianoStore';
import { useTimelineStore } from '@/store/useTimelineStore';
import { triggerDrum } from './audio';
import { triggerNotes } from './synth';
import { STEP_COUNT } from '@/types';
import type { DrumType } from '@/types';

export async function exportToWav(): Promise<void> {
  const { tracks, bpm } = useSequencerStore.getState();
  const pianoState = usePianoStore.getState();
  const { bars, barCount } = useTimelineStore.getState();

  const secondsPerStep = 60 / bpm / 4;
  const totalSteps = STEP_COUNT * barCount;
  const duration = totalSteps * secondsPerStep + 1;

  const recorder = new Tone.Recorder();
  Tone.getDestination().connect(recorder);

  recorder.start();

  const transport = Tone.getTransport();
  const wasPlaying = transport.state === 'started';
  if (wasPlaying) transport.stop();

  const prevPosition = transport.position;
  transport.position = 0;
  transport.bpm.value = bpm;

  let step = 0;
  const eventId = transport.scheduleRepeat((time) => {
    const barIndex = Math.floor(step / STEP_COUNT);
    const stepInBar = step % STEP_COUNT;

    if (barIndex >= barCount) return;

    const bar = bars[barIndex];

    // Drums
    if (bar.drumEnabled) {
      const hasSolo = tracks.some((t) => t.solo);
      tracks.forEach((track) => {
        if (!track.steps[stepInBar]) return;
        if (hasSolo && !track.solo) return;
        if (!hasSolo && track.mute) return;
        triggerDrum(track.id as DrumType, time);
      });
    }

    // Piano
    if (bar.pianoEnabled && !pianoState.mute) {
      const notes = pianoState.getActiveNotes(stepInBar);
      if (notes.length > 0) triggerNotes(notes, time);
    }

    step++;
  }, '16n');

  transport.start();

  await new Promise((resolve) => setTimeout(resolve, duration * 1000));

  transport.stop();
  transport.clear(eventId);
  transport.position = prevPosition;

  const blob = await recorder.stop();
  Tone.getDestination().disconnect(recorder);
  recorder.dispose();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'beat.webm';
  a.click();
  URL.revokeObjectURL(url);
}
