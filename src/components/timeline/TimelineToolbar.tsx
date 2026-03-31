'use client';

import { useState } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useTransportStore } from '@/store/useTransportStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useTransport } from '@/hooks/useTransport';
import { tickToTimeString } from '@/lib/units';
import ExportMenu from '@/components/export/ExportMenu';

interface ToolbarProps {
  midiDeviceCount?: number;
  onToggleDrumPad?: () => void;
  showDrumPad?: boolean;
  onToggleScore?: () => void;
  showScore?: boolean;
  onToggleAI?: () => void;
  showAI?: boolean;
  onToggleLofi?: () => void;
  showLofi?: boolean;
}

export default function TimelineToolbar({ midiDeviceCount = 0, onToggleDrumPad, showDrumPad, onToggleScore, showScore, onToggleAI, showAI, onToggleLofi, showLofi }: ToolbarProps) {
  const [showExport, setShowExport] = useState(false);
  const bpm = useProjectStore((s) => s.bpm);
  const setBpm = useProjectStore((s) => s.setBpm);
  const timeSignature = useProjectStore((s) => s.timeSignature);
  const setTimeSignature = useProjectStore((s) => s.setTimeSignature);
  const addTrackToOrder = useProjectStore((s) => s.addTrackToOrder);

  const isPlaying = useTransportStore((s) => s.isPlaying);
  const currentTick = useTransportStore((s) => s.currentTick);
  const isMetronomeOn = useTransportStore((s) => s.isMetronomeOn);
  const toggleMetronome = useTransportStore((s) => s.toggleMetronome);

  const addTrack = useTrackStore((s) => s.addTrack);
  const { handleTogglePlayStop, handleStop } = useTransport();

  const handleAddTrack = (type: 'midi' | 'drum' | 'audio' | 'return' = 'midi') => {
    const id = addTrack(type);
    addTrackToOrder(id);
  };

  return (
    <div className="flex items-center gap-3 border-b border-zinc-700 bg-zinc-800 px-4 py-2">
      {/* Transport */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleTogglePlayStop}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm font-medium hover:bg-zinc-600"
          aria-label={isPlaying ? '정지' : '재생'}
        >
          {isPlaying ? '⏹' : '▶'}
        </button>
        <button
          onClick={handleStop}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm hover:bg-zinc-600"
          aria-label="처음으로"
        >
          ⏮
        </button>
      </div>

      {/* Position display */}
      <span className="min-w-[100px] rounded bg-zinc-900 px-2 py-1 text-center font-mono text-sm text-zinc-300">
        {tickToTimeString(currentTick, timeSignature[0])}
      </span>

      {/* BPM */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-zinc-400">BPM</label>
        <input
          type="number"
          value={bpm}
          onChange={(e) => setBpm(Number(e.target.value))}
          className="w-16 rounded bg-zinc-900 px-2 py-1 text-center text-sm text-zinc-200"
          min={20}
          max={999}
        />
      </div>

      {/* Time Signature */}
      <div className="flex items-center gap-1">
        <label className="text-xs text-zinc-400">박자</label>
        <select
          value={`${timeSignature[0]}/${timeSignature[1]}`}
          onChange={(e) => {
            const [n, d] = e.target.value.split('/').map(Number);
            setTimeSignature([n, d]);
          }}
          className="rounded bg-zinc-900 px-2 py-1 text-sm text-zinc-200"
        >
          <option value="4/4">4/4</option>
          <option value="3/4">3/4</option>
          <option value="6/8">6/8</option>
          <option value="2/4">2/4</option>
          <option value="5/4">5/4</option>
        </select>
      </div>

      {/* Metronome toggle */}
      <button
        onClick={toggleMetronome}
        className={`rounded px-2 py-1 text-sm ${
          isMetronomeOn
            ? 'bg-blue-600 text-white'
            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
        }`}
        aria-label={isMetronomeOn ? '메트로놈 끄기' : '메트로놈 켜기'}
      >
        메트로놈
      </button>

      {/* Drum pad toggle */}
      {onToggleDrumPad && (
        <button
          onClick={onToggleDrumPad}
          className={`rounded px-2 py-1 text-sm ${
            showDrumPad
              ? 'bg-purple-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          패드
        </button>
      )}

      {/* Score toggle */}
      {onToggleScore && (
        <button
          onClick={onToggleScore}
          className={`rounded px-2 py-1 text-sm ${
            showScore
              ? 'bg-amber-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          악보
        </button>
      )}

      {/* AI toggle */}
      {onToggleAI && (
        <button
          onClick={onToggleAI}
          className={`rounded px-2 py-1 text-sm ${
            showAI
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          AI
        </button>
      )}

      {/* Lo-Fi toggle */}
      {onToggleLofi && (
        <button
          onClick={onToggleLofi}
          className={`rounded px-2 py-1 text-sm ${
            showLofi
              ? 'bg-gradient-to-r from-indigo-600 to-pink-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
        >
          Lo-Fi
        </button>
      )}

      {/* MIDI device indicator */}
      {midiDeviceCount > 0 && (
        <span className="rounded bg-green-800 px-2 py-0.5 text-[10px] text-green-200">
          MIDI {midiDeviceCount}
        </span>
      )}

      <div className="flex-1" />

      {/* Add tracks */}
      <button
        onClick={() => handleAddTrack('midi')}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500"
      >
        + MIDI
      </button>
      <button
        onClick={() => handleAddTrack('drum')}
        className="rounded bg-purple-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-purple-500"
      >
        + Drums
      </button>
      <button
        onClick={() => handleAddTrack('audio')}
        className="rounded bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-500"
      >
        + Audio
      </button>
      <button
        onClick={() => handleAddTrack('return')}
        className="rounded bg-amber-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-500"
      >
        + Return
      </button>

      {/* Export menu */}
      <div className="relative">
        <button
          onClick={() => setShowExport((v) => !v)}
          className="rounded bg-zinc-700 px-3 py-1.5 text-sm text-zinc-200 hover:bg-zinc-600"
        >
          내보내기
        </button>
        {showExport && (
          <div className="absolute right-0 top-full z-50 mt-1">
            <ExportMenu onClose={() => setShowExport(false)} />
          </div>
        )}
      </div>
    </div>
  );
}
