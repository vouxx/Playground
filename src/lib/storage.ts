import { useSequencerStore } from '@/store/useSequencerStore';
import { usePianoStore } from '@/store/usePianoStore';
import type { Track } from '@/types';
import type { PianoNote } from '@/types';
import { PIANO_NOTES, STEP_COUNT } from '@/types';

interface ProjectData {
  version: 1;
  bpm: number;
  swing: number;
  drumTracks: Pick<Track, 'id' | 'steps' | 'volume' | 'mute' | 'solo'>[];
  pianoGrid: Record<string, boolean[]>;
  pianoPreset: string;
  pianoVolume: number;
  pianoMute: boolean;
}

const STORAGE_KEY = 'playground-project';

export function saveProject() {
  const seq = useSequencerStore.getState();
  const piano = usePianoStore.getState();

  const data: ProjectData = {
    version: 1,
    bpm: seq.bpm,
    swing: seq.swing,
    drumTracks: seq.tracks.map((t) => ({
      id: t.id,
      steps: t.steps,
      volume: t.volume,
      mute: t.mute,
      solo: t.solo,
    })),
    pianoGrid: piano.grid,
    pianoPreset: piano.preset,
    pianoVolume: piano.volume,
    pianoMute: piano.mute,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadProject(): boolean {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const data = JSON.parse(raw) as ProjectData;
    if (data.version !== 1) return false;

    const seq = useSequencerStore.getState();
    seq.setBpm(data.bpm);
    seq.setSwing(data.swing);

    // Load drum tracks
    data.drumTracks.forEach((saved) => {
      saved.steps.forEach((active, i) => {
        if (active) useSequencerStore.getState().setStep(saved.id, i, true);
      });
    });

    // Load piano
    const pianoStore = usePianoStore.getState();
    pianoStore.setPreset(data.pianoPreset as typeof pianoStore.preset);
    pianoStore.setVolume(data.pianoVolume);
    if (data.pianoMute) pianoStore.toggleMute();

    Object.entries(data.pianoGrid).forEach(([note, steps]) => {
      steps.forEach((active, i) => {
        if (active && PIANO_NOTES.includes(note as PianoNote)) {
          pianoStore.setNoteOn(note as PianoNote, i);
        }
      });
    });

    return true;
  } catch {
    return false;
  }
}

export function encodeProjectToUrl(): string {
  const seq = useSequencerStore.getState();
  const piano = usePianoStore.getState();

  const compact = {
    b: seq.bpm,
    s: seq.swing,
    d: seq.tracks.map((t) => t.steps.map((s) => (s ? 1 : 0)).join('')).join(','),
    p: PIANO_NOTES.map((note) => piano.grid[note].map((s) => (s ? 1 : 0)).join('')).join(','),
  };

  const encoded = btoa(JSON.stringify(compact));
  return `${window.location.origin}?p=${encoded}`;
}

export function decodeProjectFromUrl(): boolean {
  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('p');
  if (!encoded) return false;

  try {
    const compact = JSON.parse(atob(encoded));
    const seq = useSequencerStore.getState();
    seq.setBpm(compact.b);
    seq.setSwing(compact.s);

    const drumRows = (compact.d as string).split(',');
    const { tracks } = seq;
    drumRows.forEach((row: string, trackIdx: number) => {
      if (trackIdx >= tracks.length) return;
      [...row].forEach((ch, stepIdx) => {
        if (stepIdx < STEP_COUNT && ch === '1') {
          useSequencerStore.getState().setStep(tracks[trackIdx].id, stepIdx, true);
        }
      });
    });

    const pianoRows = (compact.p as string).split(',');
    const pianoStore = usePianoStore.getState();
    pianoRows.forEach((row: string, noteIdx: number) => {
      if (noteIdx >= PIANO_NOTES.length) return;
      [...row].forEach((ch, stepIdx) => {
        if (stepIdx < STEP_COUNT && ch === '1') {
          pianoStore.setNoteOn(PIANO_NOTES[noteIdx], stepIdx);
        }
      });
    });

    return true;
  } catch {
    return false;
  }
}
