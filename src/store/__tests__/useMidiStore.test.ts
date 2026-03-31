import { describe, it, expect, beforeEach } from 'vitest';
import { useMidiStore } from '../useMidiStore';
import { PPQ } from '@/types/daw';

beforeEach(() => {
  useMidiStore.setState({ notes: {}, noteCount: 0 });
});

describe('useMidiStore', () => {
  it('노트 추가', () => {
    const id = useMidiStore.getState().addNote('r1', 60, 0);
    const note = useMidiStore.getState().notes[id];
    expect(note.pitch).toBe(60);
    expect(note.startTick).toBe(0);
    expect(note.durationTicks).toBe(PPQ);
    expect(note.velocity).toBe(100);
  });

  it('노트 삭제', () => {
    const id = useMidiStore.getState().addNote('r1', 60, 0);
    useMidiStore.getState().removeNote(id);
    expect(useMidiStore.getState().notes[id]).toBeUndefined();
  });

  it('리전별 일괄 삭제', () => {
    useMidiStore.getState().addNote('r1', 60, 0);
    useMidiStore.getState().addNote('r1', 64, 0);
    useMidiStore.getState().addNote('r2', 67, 0);
    useMidiStore.getState().removeNotesByRegion('r1');
    expect(Object.keys(useMidiStore.getState().notes)).toHaveLength(1);
  });

  it('노트 이동', () => {
    const id = useMidiStore.getState().addNote('r1', 60, 0);
    useMidiStore.getState().moveNote(id, 72, 384);
    const note = useMidiStore.getState().notes[id];
    expect(note.pitch).toBe(72);
    expect(note.startTick).toBe(384);
  });

  it('피치 클램핑', () => {
    const id = useMidiStore.getState().addNote('r1', 200, 0);
    expect(useMidiStore.getState().notes[id].pitch).toBe(127);
  });

  it('벨로시티 설정', () => {
    const id = useMidiStore.getState().addNote('r1', 60, 0);
    useMidiStore.getState().setVelocity(id, 50);
    expect(useMidiStore.getState().notes[id].velocity).toBe(50);
  });

  it('벨로시티 클램핑', () => {
    const id = useMidiStore.getState().addNote('r1', 60, 0, PPQ, 0);
    expect(useMidiStore.getState().notes[id].velocity).toBe(1);
  });

  it('리전별 조회', () => {
    useMidiStore.getState().addNote('r1', 60, 0);
    useMidiStore.getState().addNote('r1', 64, 192);
    useMidiStore.getState().addNote('r2', 67, 0);
    expect(useMidiStore.getState().getNotesByRegion('r1')).toHaveLength(2);
  });
});
