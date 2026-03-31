'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useScoreStore } from '@/store/useScoreStore';
import { useMidiStore } from '@/store/useMidiStore';
import { useRegionStore } from '@/store/useRegionStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useTransportStore } from '@/store/useTransportStore';
import {
  KEY_SIGNATURES,
  pitchToVexKey,
  ticksToVexDuration,
  autoSelectClef,
  groupNotesByBar,
  velocityToDynamic,
} from '@/lib/score';
import type { MidiNote } from '@/types/daw';

export default function ScorePanel() {
  const isOpen = useScoreStore((s) => s.isOpen);
  const trackId = useScoreStore((s) => s.trackId);
  const keySignature = useScoreStore((s) => s.keySignature);
  const setKeySignature = useScoreStore((s) => s.setKeySignature);
  const closeScore = useScoreStore((s) => s.closeScore);
  const regions = useRegionStore((s) => s.regions);
  const notes = useMidiStore((s) => s.notes);
  const timeSignature = useProjectStore((s) => s.timeSignature);
  const currentTick = useTransportStore((s) => s.currentTick);
  const containerRef = useRef<HTMLDivElement>(null);

  const renderScore = useCallback(async () => {
    const container = containerRef.current;
    if (!container || !trackId) return;

    // VexFlow를 동적으로 import (SSR 방지)
    const VF = await import('vexflow');
    const { Renderer, Stave, StaveNote, Formatter, Voice, Dot } = VF.default || VF;

    container.innerHTML = '';

    // 트랙의 모든 리전에서 노트 수집
    const trackRegions = Object.values(regions).filter((r) => r.trackId === trackId);
    const allNotes: MidiNote[] = [];
    for (const region of trackRegions) {
      const regionNotes = Object.values(notes)
        .filter((n) => n.regionId === region.id)
        .map((n) => ({ ...n, startTick: n.startTick + region.startTick }));
      allNotes.push(...regionNotes);
    }

    const clef = autoSelectClef(allNotes);
    const bars = groupNotesByBar(allNotes, timeSignature[0]);
    const numBars = Math.max(bars.length, 4);

    const staveWidth = 300;
    const totalWidth = (numBars + 1) * staveWidth + 50;
    const staveY = 40;

    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(totalWidth, 200);
    const context = renderer.getContext();

    for (let i = 0; i < numBars; i++) {
      const x = 20 + i * staveWidth;
      const stave = new Stave(x, staveY, staveWidth);

      if (i === 0) {
        stave.addClef(clef);
        stave.addTimeSignature(`${timeSignature[0]}/${timeSignature[1]}`);
        const keySig = KEY_SIGNATURES.find((k) => k.key === keySignature);
        if (keySig && keySig.key !== 'C') {
          stave.addKeySignature(keySig.key);
        }
      }

      stave.setContext(context).draw();

      const barNotes = bars[i] || [];
      if (barNotes.length === 0) {
        // 온쉼표
        try {
          const rest = new StaveNote({ keys: ['b/4'], duration: 'wr' });
          const voice = new Voice({ numBeats: timeSignature[0], beatValue: timeSignature[1] });
          voice.setStrict(false);
          voice.addTickables([rest]);
          new Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
          voice.draw(context, stave);
        } catch {
          // 빈 마디 렌더링 실패 시 무시
        }
        continue;
      }

      // 화음 그룹핑 (같은 시작 틱의 노트를 묶음)
      const chordGroups = new Map<number, MidiNote[]>();
      for (const note of barNotes) {
        const group = chordGroups.get(note.startTick) || [];
        group.push(note);
        chordGroups.set(note.startTick, group);
      }

      const staveNotes = [];
      for (const [, group] of [...chordGroups.entries()].sort((a, b) => a[0] - b[0])) {
        const keys = group.map((n) => pitchToVexKey(n.pitch));
        const { vexDuration, dots } = ticksToVexDuration(group[0].durationTicks);

        try {
          const staveNote = new StaveNote({
            keys,
            duration: vexDuration,
            clef,
          });
          for (let d = 0; d < dots; d++) {
            Dot.buildAndAttach([staveNote]);
          }
          staveNotes.push(staveNote);
        } catch {
          // 렌더링 불가한 음표는 스킵
        }
      }

      if (staveNotes.length > 0) {
        try {
          const voice = new Voice({ numBeats: timeSignature[0], beatValue: timeSignature[1] });
          voice.setStrict(false);
          voice.addTickables(staveNotes);
          new Formatter().joinVoices([voice]).format([voice], staveWidth - 40);
          voice.draw(context, stave);
        } catch {
          // 보이스 렌더링 실패 시 무시
        }
      }
    }
  }, [trackId, regions, notes, timeSignature, keySignature]);

  useEffect(() => {
    if (isOpen) renderScore();
  }, [isOpen, renderScore]);

  if (!isOpen) return null;

  return (
    <div className="flex flex-col border-t border-zinc-700">
      <div className="flex items-center gap-3 bg-zinc-800 px-3 py-1.5">
        <span className="text-xs font-medium text-zinc-300">악보</span>

        {/* Key signature selector */}
        <select
          value={keySignature}
          onChange={(e) => setKeySignature(e.target.value)}
          className="rounded bg-zinc-700 px-2 py-0.5 text-[10px] text-zinc-200"
        >
          {KEY_SIGNATURES.map((ks) => (
            <option key={ks.key} value={ks.key}>
              {ks.key} {ks.mode}
            </option>
          ))}
        </select>

        <div className="flex-1" />
        <button
          onClick={closeScore}
          className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700"
        >
          닫기
        </button>
      </div>
      <div
        ref={containerRef}
        className="h-[200px] overflow-x-auto overflow-y-hidden bg-white"
      />
    </div>
  );
}
