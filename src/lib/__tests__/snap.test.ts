import { describe, it, expect } from 'vitest';
import { getSnapResolution, snapToGrid, snapToGridFloor } from '../snap';
import { PPQ } from '@/types/daw';

describe('snap', () => {
  describe('getSnapResolution', () => {
    it('매우 줌 아웃 시 마디 단위 스냅', () => {
      // 아주 낮은 pixelsPerTick → 마디 단위
      expect(getSnapResolution(0.01)).toBe(4 * PPQ);
    });

    it('중간 줌에서 박자 단위 스냅', () => {
      // PPQ * ppt >= 30 이면 박자 단위
      const ppt = 30 / PPQ + 0.01;
      expect(getSnapResolution(ppt)).toBe(PPQ);
    });

    it('높은 줌에서 16분음표 스냅', () => {
      // PPQ/4 * ppt >= 30
      const ppt = 30 / (PPQ / 4) + 0.01;
      expect(getSnapResolution(ppt)).toBe(PPQ / 4);
    });
  });

  describe('snapToGrid', () => {
    it('정확한 그리드 위치는 변하지 않음', () => {
      expect(snapToGrid(PPQ, PPQ)).toBe(PPQ);
    });

    it('그리드 사이 값은 가장 가까운 쪽으로', () => {
      expect(snapToGrid(PPQ + 10, PPQ)).toBe(PPQ);
      expect(snapToGrid(PPQ + PPQ - 10, PPQ)).toBe(2 * PPQ);
    });

    it('중간값은 반올림', () => {
      expect(snapToGrid(PPQ / 2, PPQ)).toBe(PPQ);
    });

    it('snapResolution 0이면 원래 값 반환', () => {
      expect(snapToGrid(123, 0)).toBe(123);
    });
  });

  describe('snapToGridFloor', () => {
    it('항상 이전(왼쪽) 그리드로', () => {
      expect(snapToGridFloor(PPQ + 10, PPQ)).toBe(PPQ);
      expect(snapToGridFloor(2 * PPQ - 1, PPQ)).toBe(PPQ);
    });

    it('정확한 위치는 변하지 않음', () => {
      expect(snapToGridFloor(PPQ, PPQ)).toBe(PPQ);
    });
  });
});
