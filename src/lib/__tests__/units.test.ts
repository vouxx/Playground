import { describe, it, expect } from 'vitest';
import {
  tickToBar,
  barToTick,
  tickToTimeString,
  tickToPixel,
  pixelToTick,
  secondsToTick,
  tickToSeconds,
  ticksPerBar,
} from '../units';
import { PPQ } from '@/types/daw';

describe('units', () => {
  describe('tickToBar', () => {
    it('tick 0은 마디 1', () => {
      expect(tickToBar(0)).toBe(1);
    });

    it('첫 마디 끝 직전은 마디 1', () => {
      expect(tickToBar(4 * PPQ - 1)).toBe(1);
    });

    it('두 번째 마디 시작은 마디 2', () => {
      expect(tickToBar(4 * PPQ)).toBe(2);
    });

    it('3/4 박자에서 마디 계산', () => {
      expect(tickToBar(3 * PPQ, 3)).toBe(2);
    });
  });

  describe('barToTick', () => {
    it('마디 1은 tick 0', () => {
      expect(barToTick(1)).toBe(0);
    });

    it('마디 5는 4마디분 틱', () => {
      expect(barToTick(5)).toBe(4 * 4 * PPQ);
    });
  });

  describe('tickToBar ↔ barToTick 왕복', () => {
    it('마디 번호 왕복 변환 일치', () => {
      for (let bar = 1; bar <= 10; bar++) {
        expect(tickToBar(barToTick(bar))).toBe(bar);
      }
    });
  });

  describe('tickToTimeString', () => {
    it('tick 0 → 1:1:000', () => {
      expect(tickToTimeString(0)).toBe('1:1:000');
    });

    it('1박 → 1:2:000', () => {
      expect(tickToTimeString(PPQ)).toBe('1:2:000');
    });

    it('1마디 → 2:1:000', () => {
      expect(tickToTimeString(4 * PPQ)).toBe('2:1:000');
    });

    it('틱 오프셋 포함', () => {
      expect(tickToTimeString(PPQ + 96)).toBe('1:2:096');
    });
  });

  describe('tickToPixel / pixelToTick', () => {
    it('기본 변환', () => {
      expect(tickToPixel(100, 0.15)).toBeCloseTo(15);
    });

    it('스크롤 오프셋 적용', () => {
      expect(tickToPixel(200, 0.15, 100)).toBeCloseTo(15);
    });

    it('왕복 변환 일치', () => {
      const tick = 500;
      const ppt = 0.15;
      const scrollX = 100;
      const px = tickToPixel(tick, ppt, scrollX);
      expect(pixelToTick(px, ppt, scrollX)).toBeCloseTo(tick);
    });
  });

  describe('secondsToTick / tickToSeconds', () => {
    it('120 BPM에서 1초 = 2박 = 384 틱', () => {
      expect(secondsToTick(1, 120)).toBe(2 * PPQ);
    });

    it('왕복 변환 일치', () => {
      const tick = 768;
      const bpm = 120;
      expect(secondsToTick(tickToSeconds(tick, bpm), bpm)).toBe(tick);
    });
  });

  describe('ticksPerBar', () => {
    it('4/4 = 768', () => {
      expect(ticksPerBar(4)).toBe(4 * PPQ);
    });

    it('3/4 = 576', () => {
      expect(ticksPerBar(3)).toBe(3 * PPQ);
    });
  });
});
