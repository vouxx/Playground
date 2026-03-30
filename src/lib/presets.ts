import type { DrumType } from '@/types';
import { STEP_COUNT } from '@/types';

export interface BeatPreset {
  name: string;
  pattern: Record<DrumType, boolean[]>;
}

function steps(...indices: number[]): boolean[] {
  return Array.from({ length: STEP_COUNT }, (_, i) => indices.includes(i));
}

const empty = (): boolean[] => Array(STEP_COUNT).fill(false);

export const BEAT_PRESETS: BeatPreset[] = [
  {
    name: 'Hip-hop',
    pattern: {
      kick: steps(0, 3, 8, 11),
      snare: steps(4, 12),
      hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: steps(6, 14),
      clap: steps(4, 12),
      rim: empty(),
      tom: empty(),
      cymbal: empty(),
    },
  },
  {
    name: 'House',
    pattern: {
      kick: steps(0, 4, 8, 12),
      snare: empty(),
      hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: steps(2, 6, 10, 14),
      clap: steps(4, 12),
      rim: empty(),
      tom: empty(),
      cymbal: empty(),
    },
  },
  {
    name: 'Rock',
    pattern: {
      kick: steps(0, 8),
      snare: steps(4, 12),
      hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: empty(),
      clap: empty(),
      rim: empty(),
      tom: empty(),
      cymbal: steps(0),
    },
  },
  {
    name: 'Trap',
    pattern: {
      kick: steps(0, 7, 8),
      snare: steps(4, 12),
      hihat: steps(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15),
      openhat: empty(),
      clap: steps(4, 12),
      rim: steps(2, 10),
      tom: empty(),
      cymbal: empty(),
    },
  },
  {
    name: 'Reggaeton',
    pattern: {
      kick: steps(0, 3, 4, 7, 8, 11, 12, 15),
      snare: steps(4, 12),
      hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: empty(),
      clap: steps(3, 7, 11, 15),
      rim: empty(),
      tom: empty(),
      cymbal: empty(),
    },
  },
  {
    name: 'Lo-fi',
    pattern: {
      kick: steps(0, 5, 8, 13),
      snare: steps(4, 12),
      hihat: steps(0, 2, 4, 6, 8, 10, 12, 14),
      openhat: steps(7),
      clap: empty(),
      rim: steps(2, 10),
      tom: empty(),
      cymbal: empty(),
    },
  },
];
