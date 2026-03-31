'use client';

import { useState, useCallback } from 'react';
import { useTrackStore } from '@/store/useTrackStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useAudioStore } from '@/store/useAudioStore';
import { TRACK_COLORS } from '@/types/daw';
import type { Track } from '@/types/daw';
import { useInstrumentStore } from '@/store/useInstrumentStore';
import ContextMenu, { type MenuItem } from '@/components/common/ContextMenu';

interface TrackHeaderProps {
  track: Track;
  index: number;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  onSelect?: () => void;
  selected?: boolean;
}

export default function TrackHeader({
  track, index, onDragStart, onDragOver, onDragEnd, onSelect, selected,
}: TrackHeaderProps) {
  const setVolume = useTrackStore((s) => s.setVolume);
  const setPan = useTrackStore((s) => s.setPan);
  const toggleMute = useTrackStore((s) => s.toggleMute);
  const toggleSolo = useTrackStore((s) => s.toggleSolo);
  const updateTrack = useTrackStore((s) => s.updateTrack);
  const removeTrack = useTrackStore((s) => s.removeTrack);
  const duplicateTrack = useTrackStore((s) => s.duplicateTrack);
  const removeTrackFromOrder = useProjectStore((s) => s.removeTrackFromOrder);
  const addTrackToOrder = useProjectStore((s) => s.addTrackToOrder);
  const removeRegionsByTrack = useRegionStore((s) => s.removeRegionsByTrack);
  const presets = useInstrumentStore((s) => s.presets);
  const toggleArm = useAudioStore((s) => s.toggleArm);
  const isArmed = useAudioStore((s) => s.isArmed(track.id));

  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(track.name);
  const [showColors, setShowColors] = useState(false);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setCtxMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const handleRename = useCallback(() => {
    setEditName(track.name);
    setIsEditing(true);
  }, [track.name]);

  const commitName = useCallback(() => {
    const name = editName.trim() || track.name;
    updateTrack(track.id, { name });
    setIsEditing(false);
  }, [editName, track.id, track.name, updateTrack]);

  const handleDelete = useCallback(() => {
    removeRegionsByTrack(track.id);
    removeTrackFromOrder(track.id);
    removeTrack(track.id);
  }, [track.id, removeRegionsByTrack, removeTrackFromOrder, removeTrack]);

  const handleDuplicate = useCallback(() => {
    const newId = duplicateTrack(track.id);
    if (newId) addTrackToOrder(newId);
  }, [track.id, duplicateTrack, addTrackToOrder]);

  const menuItems: MenuItem[] = [
    { label: '이름 변경', onClick: handleRename },
    { label: '복제', onClick: handleDuplicate },
    { label: '색상 변경', onClick: () => setShowColors(true) },
    { label: '삭제', onClick: handleDelete, danger: true },
  ];

  const volumeDisplay =
    track.mixer.volume <= -60
      ? '-∞'
      : `${track.mixer.volume > 0 ? '+' : ''}${track.mixer.volume.toFixed(1)}`;

  return (
    <>
      <div
        className={`flex items-center gap-2 border-b border-zinc-700 px-3 ${selected ? 'bg-zinc-700' : 'bg-zinc-800'}`}
        style={{ height: 60 }}
        onClick={onSelect}
        onContextMenu={handleContextMenu}
        draggable
        onDragStart={() => onDragStart(index)}
        onDragOver={(e) => { e.preventDefault(); onDragOver(index); }}
        onDragEnd={onDragEnd}
      >
        {/* Color indicator */}
        <div
          className="h-8 w-1 rounded-full"
          style={{ backgroundColor: track.color }}
        />

        {/* Name */}
        {isEditing ? (
          <input
            className="w-20 rounded bg-zinc-700 px-1 text-xs text-zinc-200"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={commitName}
            onKeyDown={(e) => { if (e.key === 'Enter') commitName(); }}
            autoFocus
          />
        ) : (
          <span
            className="w-20 cursor-pointer truncate text-xs text-zinc-200"
            onDoubleClick={handleRename}
          >
            {track.name}
          </span>
        )}

        {/* Instrument select */}
        <select
          value={track.instrumentId}
          onChange={(e) => updateTrack(track.id, { instrumentId: e.target.value })}
          className="w-14 rounded bg-zinc-700 px-1 py-0.5 text-[10px] text-zinc-300"
          aria-label={`${track.name} 악기`}
        >
          {presets.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Volume */}
        <input
          type="range"
          min={-60}
          max={6}
          step={0.1}
          value={track.mixer.volume <= -60 ? -60 : track.mixer.volume}
          onChange={(e) => setVolume(track.id, Number(e.target.value))}
          className="h-1 w-14 accent-zinc-400"
          aria-label={`${track.name} 볼륨`}
        />
        <span className="w-9 text-right font-mono text-[10px] text-zinc-400">
          {volumeDisplay}
        </span>

        {/* Pan */}
        <input
          type="range"
          min={-100}
          max={100}
          step={1}
          value={Math.round(track.mixer.pan * 100)}
          onChange={(e) => setPan(track.id, Number(e.target.value) / 100)}
          className="h-1 w-8 accent-zinc-400"
          aria-label={`${track.name} 팬`}
        />

        {/* M / S */}
        <button
          onClick={() => toggleMute(track.id)}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            track.mixer.mute
              ? 'bg-yellow-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
          aria-label={`${track.name} 뮤트`}
        >
          M
        </button>
        <button
          onClick={() => toggleSolo(track.id)}
          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
            track.mixer.solo
              ? 'bg-green-600 text-white'
              : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
          }`}
          aria-label={`${track.name} 솔로`}
        >
          S
        </button>
        {track.type === 'audio' && (
          <button
            onClick={() => toggleArm(track.id)}
            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
              isArmed
                ? 'bg-red-600 text-white'
                : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
            }`}
            aria-label={`${track.name} 녹음 대기`}
          >
            R
          </button>
        )}
      </div>

      {/* Context menu */}
      {ctxMenu && (
        <ContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          items={menuItems}
          onClose={() => setCtxMenu(null)}
        />
      )}

      {/* Color picker */}
      {showColors && (
        <div className="fixed inset-0 z-50" onClick={() => setShowColors(false)}>
          <div
            className="absolute grid grid-cols-5 gap-1 rounded-md border border-zinc-600 bg-zinc-800 p-2"
            style={{ left: 210, top: 60 * index + 60 }}
            onClick={(e) => e.stopPropagation()}
          >
            {TRACK_COLORS.map((c) => (
              <button
                key={c}
                className="h-5 w-5 rounded-full border border-zinc-600 hover:scale-110"
                style={{ backgroundColor: c }}
                onClick={() => {
                  updateTrack(track.id, { color: c });
                  setShowColors(false);
                }}
                aria-label={`색상 ${c}`}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
