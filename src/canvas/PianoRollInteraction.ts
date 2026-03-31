import type { MidiNote } from '@/types/daw';
import { PPQ } from '@/types/daw';
import { PianoRollRenderer, KEYBOARD_WIDTH } from './PianoRollRenderer';
import { snapToGrid, getSnapResolution } from '@/lib/snap';

type Mode = 'none' | 'move' | 'resize';

interface Callbacks {
  onNoteCreate: (pitch: number, startTick: number) => void;
  onNoteMove: (id: string, pitch: number, startTick: number) => void;
  onNoteResize: (id: string, durationTicks: number) => void;
  onNoteSelect: (id: string, addToSelection: boolean) => void;
  onNoteDelete: () => void;
  onDeselectAll: () => void;
  getNotes: () => MidiNote[];
  getSelectedIds: () => string[];
  getBeatsPerBar: () => number;
  getPixelsPerTick: () => number;
  getNoteHeight: () => number;
}

const HANDLE_WIDTH = 6;

export class PianoRollInteraction {
  private renderer: PianoRollRenderer;
  private canvas: HTMLCanvasElement;
  private callbacks: Callbacks;
  private mode: Mode = 'none';
  private dragNoteId: string | null = null;
  private dragOffsetTick = 0;
  private originalPitch = 0;

  constructor(canvas: HTMLCanvasElement, renderer: PianoRollRenderer, callbacks: Callbacks) {
    this.canvas = canvas;
    this.renderer = renderer;
    this.callbacks = callbacks;
    this.attach();
  }

  private attach(): void {
    this.canvas.addEventListener('mousedown', this.onMouseDown);
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('mouseup', this.onMouseUp);
    this.canvas.addEventListener('keydown', this.onKeyDown);
  }

  dispose(): void {
    this.canvas.removeEventListener('mousedown', this.onMouseDown);
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('mouseup', this.onMouseUp);
    this.canvas.removeEventListener('keydown', this.onKeyDown);
  }

  private getPos(e: MouseEvent): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  private hitTest(x: number, y: number): { type: 'note' | 'resize' | 'empty'; noteId?: string } {
    if (x < KEYBOARD_WIDTH) return { type: 'empty' };

    const tick = this.renderer.xToTick(x);
    const pitch = this.renderer.yToPitch(y);
    const notes = this.callbacks.getNotes();
    const ppt = this.callbacks.getPixelsPerTick();

    for (let i = notes.length - 1; i >= 0; i--) {
      const n = notes[i];
      if (n.pitch !== pitch) continue;
      if (tick >= n.startTick && tick <= n.startTick + n.durationTicks) {
        const scrollX = (this.renderer as any).state?.scrollX || 0;
        const noteEndPx = KEYBOARD_WIDTH + (n.startTick + n.durationTicks - scrollX) * ppt;
        if (x > noteEndPx - HANDLE_WIDTH) {
          return { type: 'resize', noteId: n.id };
        }
        return { type: 'note', noteId: n.id };
      }
    }
    return { type: 'empty' };
  }

  private onMouseDown = (e: MouseEvent): void => {
    if (e.button !== 0) return;
    const { x, y } = this.getPos(e);
    if (x < KEYBOARD_WIDTH) return;

    const hit = this.hitTest(x, y);

    if (hit.type === 'note' && hit.noteId) {
      this.mode = 'move';
      this.dragNoteId = hit.noteId;
      const note = this.callbacks.getNotes().find((n) => n.id === hit.noteId);
      if (note) {
        this.dragOffsetTick = this.renderer.xToTick(x) - note.startTick;
        this.originalPitch = note.pitch;
      }
      this.callbacks.onNoteSelect(hit.noteId, e.shiftKey);
    } else if (hit.type === 'resize' && hit.noteId) {
      this.mode = 'resize';
      this.dragNoteId = hit.noteId;
      this.callbacks.onNoteSelect(hit.noteId, false);
    } else {
      // Create note
      const tick = this.renderer.xToTick(x);
      const pitch = this.renderer.yToPitch(y);
      const beatsPerBar = this.callbacks.getBeatsPerBar();
      const ppt = this.callbacks.getPixelsPerTick();
      const snapRes = getSnapResolution(ppt, beatsPerBar);
      const snappedTick = snapToGrid(tick, snapRes);
      this.callbacks.onDeselectAll();
      this.callbacks.onNoteCreate(pitch, Math.max(0, snappedTick));
    }
  };

  private onMouseMove = (e: MouseEvent): void => {
    if (this.mode === 'none' || !this.dragNoteId) return;
    const { x, y } = this.getPos(e);

    const beatsPerBar = this.callbacks.getBeatsPerBar();
    const ppt = this.callbacks.getPixelsPerTick();
    const snapRes = getSnapResolution(ppt, beatsPerBar);

    if (this.mode === 'move') {
      const tick = this.renderer.xToTick(x) - this.dragOffsetTick;
      const pitch = this.renderer.yToPitch(y);
      const snappedTick = snapToGrid(tick, snapRes);
      this.callbacks.onNoteMove(this.dragNoteId, pitch, Math.max(0, snappedTick));
    } else if (this.mode === 'resize') {
      const note = this.callbacks.getNotes().find((n) => n.id === this.dragNoteId);
      if (note) {
        const endTick = this.renderer.xToTick(x);
        const snappedEnd = snapToGrid(endTick, snapRes);
        const newDuration = Math.max(snapRes, snappedEnd - note.startTick);
        this.callbacks.onNoteResize(this.dragNoteId, newDuration);
      }
    }
  };

  private onMouseUp = (): void => {
    this.mode = 'none';
    this.dragNoteId = null;
  };

  private onKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (this.callbacks.getSelectedIds().length > 0) {
        e.preventDefault();
        this.callbacks.onNoteDelete();
      }
    }
  };
}
