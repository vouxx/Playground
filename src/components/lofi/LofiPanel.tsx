'use client';

import { useCallback } from 'react';
import { useLofiStore } from '@/store/useLofiStore';
import {
  startLofi, stopLofi,
  setLofiMood, setLofiFilterFreq, setLofiCrackle, setLofiVolume,
} from '@/engine/lofi';
import type { LofiMood } from '@/engine/lofi';

const MOODS: { value: LofiMood; label: string; emoji: string }[] = [
  { value: 'chill', label: 'Chill', emoji: '🌙' },
  { value: 'jazzy', label: 'Jazzy', emoji: '🎷' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧' },
];

interface LofiPanelProps {
  onClose: () => void;
}

export default function LofiPanel({ onClose }: LofiPanelProps) {
  const isPlaying = useLofiStore((s) => s.isPlaying);
  const mood = useLofiStore((s) => s.mood);
  const bpm = useLofiStore((s) => s.bpm);
  const filterFreq = useLofiStore((s) => s.filterFreq);
  const crackle = useLofiStore((s) => s.crackle);
  const volume = useLofiStore((s) => s.volume);

  const handleToggle = useCallback(async () => {
    if (isPlaying) {
      stopLofi();
      useLofiStore.getState().stop();
    } else {
      const state = useLofiStore.getState();
      await startLofi(state.mood, state.bpm);
      useLofiStore.getState().play();
    }
  }, [isPlaying]);

  const handleMoodChange = useCallback((m: LofiMood) => {
    useLofiStore.getState().setMood(m);
    setLofiMood(m);
  }, []);

  const handleBpmChange = useCallback((val: number) => {
    useLofiStore.getState().setBpm(val);
  }, []);

  const handleFilterChange = useCallback((val: number) => {
    useLofiStore.getState().setFilterFreq(val);
    setLofiFilterFreq(val);
  }, []);

  const handleCrackleChange = useCallback((val: number) => {
    useLofiStore.getState().setCrackle(val);
    setLofiCrackle(val);
  }, []);

  const handleVolumeChange = useCallback((val: number) => {
    useLofiStore.getState().setVolume(val);
    setLofiVolume(val);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-200">Lo-Fi</span>
        <button onClick={onClose} className="text-xs text-zinc-500 hover:text-zinc-300">
          ✕
        </button>
      </div>

      {/* Play / Stop */}
      <button
        onClick={handleToggle}
        className={`w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
          isPlaying
            ? 'bg-orange-500 text-white hover:bg-orange-400'
            : 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:opacity-90'
        }`}
      >
        {isPlaying ? '⏹ 정지' : '▶ 재생'}
      </button>

      {/* Mood Select */}
      <div>
        <label className="text-[10px] text-zinc-400">무드</label>
        <div className="mt-1 grid grid-cols-3 gap-1">
          {MOODS.map((m) => (
            <button
              key={m.value}
              onClick={() => handleMoodChange(m.value)}
              className={`rounded px-1 py-1.5 text-xs transition-colors ${
                mood === m.value
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* BPM */}
      <SliderControl
        label="BPM"
        value={bpm}
        min={50}
        max={100}
        step={1}
        display={`${bpm}`}
        onChange={handleBpmChange}
      />

      {/* Filter */}
      <SliderControl
        label="필터"
        value={filterFreq}
        min={200}
        max={5000}
        step={50}
        display={`${filterFreq}Hz`}
        onChange={handleFilterChange}
      />

      {/* Crackle */}
      <SliderControl
        label="바이닐"
        value={crackle}
        min={0}
        max={0.5}
        step={0.01}
        display={`${Math.round(crackle * 200)}%`}
        onChange={handleCrackleChange}
      />

      {/* Volume */}
      <SliderControl
        label="볼륨"
        value={volume}
        min={0}
        max={1}
        step={0.01}
        display={`${Math.round(volume * 100)}%`}
        onChange={handleVolumeChange}
      />
    </div>
  );
}

// ── Slider 컨트롤 (내부 컴포넌트) ───────────────────
interface SliderControlProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (val: number) => void;
}

function SliderControl({ label, value, min, max, step, display, onChange }: SliderControlProps) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label className="text-[10px] text-zinc-400">{label}</label>
        <span className="text-[10px] text-zinc-500">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-indigo-500"
      />
    </div>
  );
}
