'use client';

import { useState, useCallback } from 'react';
import { generate, generateFullTracks } from '@/ai/service';
import type { Genre, Complexity, GenerationType } from '@/ai/types';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useMidiStore } from '@/store/useMidiStore';
import { DEFAULT_REGION_DURATION, PPQ } from '@/types/daw';

const GENRES: { value: Genre; label: string }[] = [
  { value: 'pop', label: 'Pop' },
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'edm', label: 'EDM' },
  { value: 'lofi', label: 'Lo-Fi' },
];

const KEYS = ['C', 'G', 'D', 'A', 'E', 'F', 'Bb', 'Am', 'Em', 'Dm'];
const COMPLEXITIES: { value: Complexity; label: string }[] = [
  { value: 'simple', label: '단순' },
  { value: 'medium', label: '보통' },
  { value: 'complex', label: '복잡' },
];

interface AIPanelProps {
  onClose: () => void;
}

export default function AIPanel({ onClose }: AIPanelProps) {
  const [genre, setGenre] = useState<Genre>('pop');
  const [key, setKey] = useState('C');
  const [bars, setBars] = useState(8);
  const [complexity, setComplexity] = useState<Complexity>('medium');
  const [generating, setGenerating] = useState(false);

  const bpm = useProjectStore((s) => s.bpm);
  const timeSignature = useProjectStore((s) => s.timeSignature);
  const addTrackToOrder = useProjectStore((s) => s.addTrackToOrder);

  const insertResult = useCallback(
    (
      notes: { pitch: number; startTick: number; durationTicks: number; velocity: number }[],
      preset: string,
      trackName: string,
      trackType: 'midi' | 'drum' = 'midi',
    ) => {
      const trackId = useTrackStore.getState().addTrack(trackType);
      useTrackStore.getState().updateTrack(trackId, { name: trackName, instrumentId: preset });
      addTrackToOrder(trackId);

      const totalTicks = bars * timeSignature[0] * PPQ;
      const regionId = useRegionStore.getState().addRegion(trackId, 0, totalTicks);

      for (const note of notes) {
        useMidiStore.getState().addNote(
          regionId, note.pitch, note.startTick, note.durationTicks, note.velocity,
        );
      }
    },
    [bars, timeSignature, addTrackToOrder],
  );

  const handleGenerate = useCallback(async (type: GenerationType) => {
    setGenerating(true);
    try {
      if (type === 'full') {
        const results = await generateFullTracks(key, genre, bars, timeSignature[0], bpm);
        const types: ('drum' | 'midi')[] = ['drum', 'midi', 'midi', 'midi'];
        for (let i = 0; i < results.length; i++) {
          const r = results[i];
          insertResult(r.notes, r.suggestedPreset, r.trackName, types[i]);
        }
      } else {
        const result = await generate({
          type, key, genre, bars,
          beatsPerBar: timeSignature[0],
          bpm, complexity,
        });
        const trackType = type === 'drums' ? 'drum' : 'midi';
        insertResult(result.notes, result.suggestedPreset, result.trackName, trackType);
      }
    } finally {
      setGenerating(false);
    }
  }, [key, genre, bars, timeSignature, bpm, complexity, insertResult]);

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">AI 작곡</span>
        <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300">✕</button>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-[10px] text-zinc-400">조</label>
          <select value={key} onChange={(e) => setKey(e.target.value)}
            className="w-full rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200">
            {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zinc-400">장르</label>
          <select value={genre} onChange={(e) => setGenre(e.target.value as Genre)}
            className="w-full rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200">
            {GENRES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] text-zinc-400">마디</label>
          <input type="number" value={bars} min={1} max={64}
            onChange={(e) => setBars(Number(e.target.value))}
            className="w-full rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200" />
        </div>
        <div>
          <label className="text-[10px] text-zinc-400">복잡도</label>
          <select value={complexity} onChange={(e) => setComplexity(e.target.value as Complexity)}
            className="w-full rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-200">
            {COMPLEXITIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {/* Generate buttons */}
      <div className="flex flex-col gap-1.5">
        <button onClick={() => handleGenerate('full')} disabled={generating}
          className="rounded bg-gradient-to-r from-blue-600 to-purple-600 px-3 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50">
          {generating ? '생성 중...' : '전체 트랙 생성'}
        </button>
        <div className="grid grid-cols-2 gap-1.5">
          <button onClick={() => handleGenerate('chords')} disabled={generating}
            className="rounded bg-zinc-700 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-600 disabled:opacity-50">
            코드
          </button>
          <button onClick={() => handleGenerate('melody')} disabled={generating}
            className="rounded bg-zinc-700 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-600 disabled:opacity-50">
            멜로디
          </button>
          <button onClick={() => handleGenerate('bass')} disabled={generating}
            className="rounded bg-zinc-700 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-600 disabled:opacity-50">
            베이스
          </button>
          <button onClick={() => handleGenerate('drums')} disabled={generating}
            className="rounded bg-zinc-700 px-2 py-1.5 text-xs text-zinc-200 hover:bg-zinc-600 disabled:opacity-50">
            드럼
          </button>
        </div>
      </div>
    </div>
  );
}
