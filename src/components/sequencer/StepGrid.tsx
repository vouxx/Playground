'use client';

import { useSequencerStore } from '@/store/useSequencerStore';
import TrackRow from './TrackRow';

export default function StepGrid() {
  const tracks = useSequencerStore((s) => s.tracks);

  return (
    <section className="overflow-x-auto rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex flex-col">
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} />
        ))}
      </div>
    </section>
  );
}
