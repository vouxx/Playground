'use client';

import { useState } from 'react';
import { useEffectsStore } from '@/store/useEffectsStore';
import type { EffectType, EffectInstance } from '@/types/daw';

const EFFECT_TYPES: { type: EffectType; label: string }[] = [
  { type: 'eq3', label: 'EQ' },
  { type: 'compressor', label: 'Compressor' },
  { type: 'reverb', label: 'Reverb' },
  { type: 'delay', label: 'Delay' },
  { type: 'chorus', label: 'Chorus' },
  { type: 'distortion', label: 'Distortion' },
];

interface EffectChainPanelProps {
  trackId: string;
}

export default function EffectChainPanel({ trackId }: EffectChainPanelProps) {
  const chain = useEffectsStore((s) => s.getChain(trackId));
  const addEffect = useEffectsStore((s) => s.addEffect);
  const removeEffect = useEffectsStore((s) => s.removeEffect);
  const toggleBypass = useEffectsStore((s) => s.toggleBypass);
  const setEffectParam = useEffectsStore((s) => s.setEffectParam);
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="flex flex-col gap-1 p-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-400">이펙트</span>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 hover:bg-zinc-600"
        >
          +
        </button>
      </div>

      {showAdd && (
        <div className="flex flex-wrap gap-1">
          {EFFECT_TYPES.map((et) => (
            <button
              key={et.type}
              onClick={() => { addEffect(trackId, et.type); setShowAdd(false); }}
              className="rounded bg-zinc-600 px-2 py-0.5 text-[10px] text-zinc-200 hover:bg-zinc-500"
            >
              {et.label}
            </button>
          ))}
        </div>
      )}

      {chain.map((effect) => (
        <EffectSlot
          key={effect.id}
          trackId={trackId}
          effect={effect}
          onRemove={() => removeEffect(trackId, effect.id)}
          onBypass={() => toggleBypass(trackId, effect.id)}
          onParamChange={(k, v) => setEffectParam(trackId, effect.id, k, v)}
        />
      ))}

      {chain.length === 0 && (
        <span className="text-[10px] text-zinc-600">이펙트 없음</span>
      )}
    </div>
  );
}

interface EffectSlotProps {
  trackId: string;
  effect: EffectInstance;
  onRemove: () => void;
  onBypass: () => void;
  onParamChange: (key: string, value: number) => void;
}

function EffectSlot({ effect, onRemove, onBypass, onParamChange }: EffectSlotProps) {
  const label = EFFECT_TYPES.find((t) => t.type === effect.type)?.label ?? effect.type;

  return (
    <div className={`rounded border px-2 py-1 ${
      effect.bypass ? 'border-zinc-700 opacity-50' : 'border-zinc-600'
    }`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-zinc-300">{label}</span>
        <div className="flex gap-1">
          <button
            onClick={onBypass}
            className={`rounded px-1 text-[9px] ${effect.bypass ? 'text-yellow-500' : 'text-zinc-500'}`}
          >
            {effect.bypass ? 'OFF' : 'ON'}
          </button>
          <button onClick={onRemove} className="text-[9px] text-red-400">✕</button>
        </div>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
        {Object.entries(effect.params).map(([key, val]) => (
          <div key={key} className="flex items-center gap-1">
            <label className="text-[9px] text-zinc-500">{key}</label>
            <input
              type="range"
              min={getParamMin(effect.type, key)}
              max={getParamMax(effect.type, key)}
              step={getParamStep(effect.type, key)}
              value={val}
              onChange={(e) => onParamChange(key, Number(e.target.value))}
              className="h-1 w-12 accent-blue-500"
            />
            <span className="w-8 text-right text-[9px] text-zinc-500">{val.toFixed(1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getParamMin(type: EffectType, key: string): number {
  if (key === 'threshold') return -60;
  if (key === 'low' || key === 'mid' || key === 'high') return -12;
  if (key === 'ratio') return 1;
  return 0;
}

function getParamMax(type: EffectType, key: string): number {
  if (key === 'threshold') return 0;
  if (key === 'low' || key === 'mid' || key === 'high') return 12;
  if (key === 'ratio') return 20;
  if (key === 'decay') return 10;
  if (key === 'delayTime' && type === 'delay') return 1;
  if (key === 'delayTime' && type === 'chorus') return 20;
  if (key === 'knee') return 40;
  if (key === 'lowFreq') return 1000;
  if (key === 'highFreq') return 8000;
  if (key === 'frequency') return 10;
  if (key === 'depth') return 1;
  return 1;
}

function getParamStep(_type: EffectType, key: string): number {
  if (key === 'threshold' || key === 'low' || key === 'mid' || key === 'high') return 0.5;
  if (key === 'ratio') return 0.5;
  return 0.01;
}
