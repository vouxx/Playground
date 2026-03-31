'use client';

import { useState, useCallback, useRef } from 'react';
import { useProjectStore } from '@/store/useProjectStore';
import { useTrackStore } from '@/store/useTrackStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useMidiStore } from '@/store/useMidiStore';
import { encodeMidi } from '@/lib/export/midiEncoder';
import {
  downloadProjectJson,
  loadProjectFromFile,
  downloadBlob,
} from '@/lib/export/projectSerializer';
import { PPQ } from '@/types/daw';
import { tickToSeconds } from '@/lib/units';

interface ExportMenuProps {
  onClose: () => void;
}

export default function ExportMenu({ onClose }: ExportMenuProps) {
  const [exporting, setExporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportMidi = useCallback(() => {
    const tracks = Object.values(useTrackStore.getState().tracks);
    const regions = Object.values(useRegionStore.getState().regions);
    const notes = Object.values(useMidiStore.getState().notes);
    const { bpm, timeSignature, name } = useProjectStore.getState();

    const blob = encodeMidi(tracks, regions, notes, bpm, timeSignature);
    downloadBlob(blob, `${name}.mid`);
    onClose();
  }, [onClose]);

  const handleSaveProject = useCallback(() => {
    downloadProjectJson();
    onClose();
  }, [onClose]);

  const handleLoadProject = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadProjectFromFile(file);
      onClose();
    } catch (err) {
      alert('프로젝트 파일을 불러올 수 없습니다.');
    }
  }, [onClose]);

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-zinc-600 bg-zinc-800 p-2 shadow-lg">
      <span className="px-2 py-1 text-xs font-medium text-zinc-400">내보내기</span>

      <button
        onClick={handleExportMidi}
        className="rounded px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-700"
      >
        MIDI 파일 (.mid)
      </button>

      <hr className="border-zinc-700" />
      <span className="px-2 py-1 text-xs font-medium text-zinc-400">프로젝트</span>

      <button
        onClick={handleSaveProject}
        className="rounded px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-700"
      >
        프로젝트 저장 (.json)
      </button>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="rounded px-3 py-1.5 text-left text-sm text-zinc-200 hover:bg-zinc-700"
      >
        프로젝트 불러오기
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoadProject}
        className="hidden"
      />
    </div>
  );
}
