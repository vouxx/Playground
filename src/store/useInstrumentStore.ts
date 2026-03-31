import { create } from 'zustand';
import type { InstrumentPreset } from '@/types/daw';

const PRESETS: InstrumentPreset[] = [
  { id: 'piano', name: 'Piano', type: 'synth', category: 'Keys' },
  { id: 'pad', name: 'Pad', type: 'synth', category: 'Pad' },
  { id: 'bass', name: 'Bass', type: 'synth', category: 'Bass' },
  { id: 'lead', name: 'Lead', type: 'synth', category: 'Lead' },
  { id: 'strings', name: 'Strings', type: 'synth', category: 'Strings' },
  { id: 'fm', name: 'FM Synth', type: 'synth', category: 'Synth' },
  { id: 'drumkit', name: 'Drum Kit', type: 'drumkit', category: 'Drums' },
];

interface InstrumentStore {
  presets: InstrumentPreset[];
  getPreset: (id: string) => InstrumentPreset | undefined;
}

export const useInstrumentStore = create<InstrumentStore>(() => ({
  presets: PRESETS,
  getPreset: (id: string) => PRESETS.find((p) => p.id === id),
}));
