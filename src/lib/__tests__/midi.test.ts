import { describe, it, expect } from 'vitest';
import { pitchToName, nameToPitch, velocityToGain, isBlackKey } from '../midi';

describe('midi utils', () => {
  describe('pitchToName', () => {
    it('C4 = 60', () => expect(pitchToName(60)).toBe('C4'));
    it('A4 = 69', () => expect(pitchToName(69)).toBe('A4'));
    it('C-1 = 0', () => expect(pitchToName(0)).toBe('C-1'));
    it('G#3 = 56', () => expect(pitchToName(56)).toBe('G#3'));
  });

  describe('nameToPitch', () => {
    it('C4 → 60', () => expect(nameToPitch('C4')).toBe(60));
    it('A4 → 69', () => expect(nameToPitch('A4')).toBe(69));
    it('왕복 변환', () => {
      for (let p = 0; p <= 127; p++) {
        expect(nameToPitch(pitchToName(p))).toBe(p);
      }
    });
  });

  describe('velocityToGain', () => {
    it('127 → 1', () => expect(velocityToGain(127)).toBe(1));
    it('0 → 0', () => expect(velocityToGain(0)).toBe(0));
    it('64 → ~0.5', () => expect(velocityToGain(64)).toBeCloseTo(0.504, 2));
  });

  describe('isBlackKey', () => {
    it('C4(60)는 백건', () => expect(isBlackKey(60)).toBe(false));
    it('C#4(61)는 흑건', () => expect(isBlackKey(61)).toBe(true));
    it('E4(64)는 백건', () => expect(isBlackKey(64)).toBe(false));
    it('F#4(66)는 흑건', () => expect(isBlackKey(66)).toBe(true));
  });
});
