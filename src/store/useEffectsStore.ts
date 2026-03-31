import { create } from 'zustand';
import type { EffectInstance, EffectType, SendConfig, AutomationLane, AutomationPoint } from '@/types/daw';

const MAX_EFFECTS_PER_TRACK = 8;

function defaultParams(type: EffectType): Record<string, number> {
  switch (type) {
    case 'eq3': return { low: 0, mid: 0, high: 0, lowFreq: 400, highFreq: 2500 };
    case 'compressor': return { threshold: -24, ratio: 4, attack: 0.003, release: 0.25, knee: 30 };
    case 'reverb': return { decay: 2.5, wet: 0.3 };
    case 'delay': return { delayTime: 0.25, feedback: 0.3, wet: 0.25 };
    case 'chorus': return { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 0.3 };
    case 'distortion': return { distortion: 0.4, wet: 0.5 };
  }
}

interface EffectsStore {
  /** trackId → EffectInstance[] (순서 유지) */
  chains: Record<string, EffectInstance[]>;
  /** trackId → SendConfig[] */
  sends: Record<string, SendConfig[]>;
  /** AutomationLane[] */
  automationLanes: AutomationLane[];

  // Effects
  addEffect: (trackId: string, type: EffectType) => string | null;
  removeEffect: (trackId: string, effectId: string) => void;
  reorderEffect: (trackId: string, fromIdx: number, toIdx: number) => void;
  toggleBypass: (trackId: string, effectId: string) => void;
  setEffectParam: (trackId: string, effectId: string, key: string, value: number) => void;
  getChain: (trackId: string) => EffectInstance[];

  // Sends
  setSend: (trackId: string, returnTrackId: string, level: number) => void;
  removeSend: (trackId: string, returnTrackId: string) => void;
  getSends: (trackId: string) => SendConfig[];

  // Automation
  addAutomationLane: (trackId: string, parameterKey: string) => string;
  removeAutomationLane: (laneId: string) => void;
  addAutomationPoint: (laneId: string, tick: number, value: number) => void;
  removeAutomationPoint: (laneId: string, index: number) => void;
  moveAutomationPoint: (laneId: string, index: number, tick: number, value: number) => void;
  getAutomationValue: (laneId: string, tick: number) => number | null;
}

export const useEffectsStore = create<EffectsStore>((set, get) => ({
  chains: {},
  sends: {},
  automationLanes: [],

  addEffect: (trackId, type) => {
    const chain = get().chains[trackId] || [];
    if (chain.length >= MAX_EFFECTS_PER_TRACK) return null;
    const id = crypto.randomUUID();
    const effect: EffectInstance = { id, type, params: defaultParams(type), bypass: false };
    set((s) => ({
      chains: { ...s.chains, [trackId]: [...(s.chains[trackId] || []), effect] },
    }));
    return id;
  },

  removeEffect: (trackId, effectId) =>
    set((s) => ({
      chains: {
        ...s.chains,
        [trackId]: (s.chains[trackId] || []).filter((e) => e.id !== effectId),
      },
    })),

  reorderEffect: (trackId, fromIdx, toIdx) =>
    set((s) => {
      const chain = [...(s.chains[trackId] || [])];
      const [moved] = chain.splice(fromIdx, 1);
      chain.splice(toIdx, 0, moved);
      return { chains: { ...s.chains, [trackId]: chain } };
    }),

  toggleBypass: (trackId, effectId) =>
    set((s) => ({
      chains: {
        ...s.chains,
        [trackId]: (s.chains[trackId] || []).map((e) =>
          e.id === effectId ? { ...e, bypass: !e.bypass } : e,
        ),
      },
    })),

  setEffectParam: (trackId, effectId, key, value) =>
    set((s) => ({
      chains: {
        ...s.chains,
        [trackId]: (s.chains[trackId] || []).map((e) =>
          e.id === effectId ? { ...e, params: { ...e.params, [key]: value } } : e,
        ),
      },
    })),

  getChain: (trackId) => get().chains[trackId] || [],

  setSend: (trackId, returnTrackId, level) =>
    set((s) => {
      const sends = [...(s.sends[trackId] || [])];
      const idx = sends.findIndex((s) => s.returnTrackId === returnTrackId);
      if (idx >= 0) {
        sends[idx] = { returnTrackId, level };
      } else {
        sends.push({ returnTrackId, level });
      }
      return { sends: { ...s.sends, [trackId]: sends } };
    }),

  removeSend: (trackId, returnTrackId) =>
    set((s) => ({
      sends: {
        ...s.sends,
        [trackId]: (s.sends[trackId] || []).filter((s) => s.returnTrackId !== returnTrackId),
      },
    })),

  getSends: (trackId) => get().sends[trackId] || [],

  addAutomationLane: (trackId, parameterKey) => {
    const id = crypto.randomUUID();
    const lane: AutomationLane = { id, trackId, parameterKey, points: [] };
    set((s) => ({ automationLanes: [...s.automationLanes, lane] }));
    return id;
  },

  removeAutomationLane: (laneId) =>
    set((s) => ({ automationLanes: s.automationLanes.filter((l) => l.id !== laneId) })),

  addAutomationPoint: (laneId, tick, value) =>
    set((s) => ({
      automationLanes: s.automationLanes.map((l) =>
        l.id === laneId
          ? {
              ...l,
              points: [...l.points, { tick, value: Math.max(0, Math.min(1, value)) }]
                .sort((a, b) => a.tick - b.tick),
            }
          : l,
      ),
    })),

  removeAutomationPoint: (laneId, index) =>
    set((s) => ({
      automationLanes: s.automationLanes.map((l) =>
        l.id === laneId
          ? { ...l, points: l.points.filter((_, i) => i !== index) }
          : l,
      ),
    })),

  moveAutomationPoint: (laneId, index, tick, value) =>
    set((s) => ({
      automationLanes: s.automationLanes.map((l) =>
        l.id === laneId
          ? {
              ...l,
              points: l.points
                .map((p, i) => i === index ? { tick, value: Math.max(0, Math.min(1, value)) } : p)
                .sort((a, b) => a.tick - b.tick),
            }
          : l,
      ),
    })),

  getAutomationValue: (laneId, tick) => {
    const lane = get().automationLanes.find((l) => l.id === laneId);
    if (!lane || lane.points.length === 0) return null;

    const pts = lane.points;
    if (tick <= pts[0].tick) return pts[0].value;
    if (tick >= pts[pts.length - 1].tick) return pts[pts.length - 1].value;

    for (let i = 0; i < pts.length - 1; i++) {
      if (tick >= pts[i].tick && tick <= pts[i + 1].tick) {
        const t = (tick - pts[i].tick) / (pts[i + 1].tick - pts[i].tick);
        return pts[i].value + t * (pts[i + 1].value - pts[i].value);
      }
    }
    return null;
  },
}));
