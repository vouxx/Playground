import type { MidiNote } from '@/types/daw';
import { PPQ } from '@/types/daw';
import { isBlackKey, pitchToName, PIANO_ROLL_MIN_PITCH, PIANO_ROLL_MAX_PITCH } from '@/lib/midi';
import { getSnapResolution } from '@/lib/snap';

const BG_COLOR = '#1a1a2e';
const GRID_LINE = 'rgba(255,255,255,0.06)';
const GRID_BAR = 'rgba(255,255,255,0.15)';
const BLACK_KEY_BG = 'rgba(0,0,0,0.2)';
const NOTE_COLOR = '#3B82F6';
const NOTE_SELECTED = '#FFFFFF';
const KEYBOARD_WIDTH = 48;
const WHITE_KEY_COLOR = '#e2e2e2';
const BLACK_KEY_COLOR = '#333';
const KEY_LABEL_COLOR = '#666';

export interface PianoRollRenderState {
  scrollX: number;
  scrollY: number;
  pixelsPerTick: number;
  noteHeight: number;
  notes: MidiNote[];
  selectedNoteIds: string[];
  currentTick: number;
  beatsPerBar: number;
  regionStartTick: number;
  regionDurationTicks: number;
  isDrumTrack: boolean;
  drumNames?: Record<number, string>;
}

export class PianoRollRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private rafId: number | null = null;
  private state: PianoRollRenderState | null = null;
  private dirty = true;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not available');
    this.ctx = ctx;
  }

  setState(state: PianoRollRenderState): void {
    this.state = state;
    this.dirty = true;
  }

  start(): void {
    if (this.rafId !== null) return;
    const loop = (): void => {
      this.rafId = requestAnimationFrame(loop);
      if (!this.dirty || !this.state) return;
      this.render();
      this.dirty = false;
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose(): void { this.stop(); }

  get keyboardWidth(): number { return KEYBOARD_WIDTH; }

  private render(): void {
    const s = this.state!;
    const { ctx, canvas } = this;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;

    // DPR 보정: 매 프레임 리셋
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const gridW = w - KEYBOARD_WIDTH;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = BG_COLOR;
    ctx.fillRect(0, 0, w, h);

    // Black key row backgrounds
    for (let pitch = PIANO_ROLL_MIN_PITCH; pitch <= PIANO_ROLL_MAX_PITCH; pitch++) {
      if (isBlackKey(pitch)) {
        const y = this.pitchToY(pitch, s);
        if (y < -s.noteHeight || y > h) continue;
        ctx.fillStyle = BLACK_KEY_BG;
        ctx.fillRect(KEYBOARD_WIDTH, y, gridW, s.noteHeight);
      }
    }

    // Grid lines
    const snapRes = getSnapResolution(s.pixelsPerTick, s.beatsPerBar);
    const ticksPerBar = s.beatsPerBar * PPQ;
    const startTick = s.scrollX;
    const endTick = s.scrollX + gridW / s.pixelsPerTick;
    const firstTick = Math.floor(startTick / snapRes) * snapRes;

    for (let tick = firstTick; tick <= endTick; tick += snapRes) {
      const x = KEYBOARD_WIDTH + (tick - s.scrollX) * s.pixelsPerTick;
      const isBar = tick % ticksPerBar === 0;
      ctx.strokeStyle = isBar ? GRID_BAR : GRID_LINE;
      ctx.lineWidth = isBar ? 1 : 0.5;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }

    // Notes
    for (const note of s.notes) {
      const x = KEYBOARD_WIDTH + (note.startTick - s.scrollX) * s.pixelsPerTick;
      const y = this.pitchToY(note.pitch, s);
      const w2 = note.durationTicks * s.pixelsPerTick;
      if (x + w2 < KEYBOARD_WIDTH || x > w || y < -s.noteHeight || y > h) continue;

      const selected = s.selectedNoteIds.includes(note.id);
      ctx.fillStyle = selected ? NOTE_SELECTED : NOTE_COLOR;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(x, y + 1, w2 - 1, s.noteHeight - 2);
      ctx.globalAlpha = 1;

      if (selected) {
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(x, y + 1, w2 - 1, s.noteHeight - 2);
      }
    }

    // Playhead (relative to region)
    const relTick = s.currentTick - s.regionStartTick;
    if (relTick >= 0 && relTick <= s.regionDurationTicks) {
      const px = KEYBOARD_WIDTH + (relTick - s.scrollX) * s.pixelsPerTick;
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }

    // Keyboard
    this.renderKeyboard(s, h);
  }

  private renderKeyboard(s: PianoRollRenderState, canvasH: number): void {
    const { ctx } = this;
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, KEYBOARD_WIDTH, canvasH);

    for (let pitch = PIANO_ROLL_MIN_PITCH; pitch <= PIANO_ROLL_MAX_PITCH; pitch++) {
      const y = this.pitchToY(pitch, s);
      if (y < -s.noteHeight || y > canvasH) continue;
      const black = isBlackKey(pitch);

      ctx.fillStyle = black ? BLACK_KEY_COLOR : WHITE_KEY_COLOR;
      const kw = black ? KEYBOARD_WIDTH * 0.65 : KEYBOARD_WIDTH - 1;
      ctx.fillRect(0, y + 0.5, kw, s.noteHeight - 1);

      // C labels
      if (pitch % 12 === 0) {
        ctx.fillStyle = KEY_LABEL_COLOR;
        ctx.font = '9px monospace';
        ctx.fillText(pitchToName(pitch), 2, y + s.noteHeight - 2);
      }
    }
  }

  private pitchToY(pitch: number, s: PianoRollRenderState): number {
    // Higher pitches at top
    return (PIANO_ROLL_MAX_PITCH - pitch) * s.noteHeight - s.scrollY;
  }

  /** Canvas 좌표 → 피치 */
  yToPitch(y: number): number {
    const s = this.state;
    if (!s) return 60;
    return PIANO_ROLL_MAX_PITCH - Math.floor((y + s.scrollY) / s.noteHeight);
  }

  /** Canvas 좌표 → 틱 (리전 상대) */
  xToTick(x: number): number {
    const s = this.state;
    if (!s) return 0;
    return (x - KEYBOARD_WIDTH) / s.pixelsPerTick + s.scrollX;
  }
}

export { KEYBOARD_WIDTH };
