import { describe, it, expect, beforeEach } from 'vitest';
import { useTransportStore } from '../useTransportStore';

beforeEach(() => {
  useTransportStore.setState({
    isPlaying: false,
    currentTick: 0,
    isMetronomeOn: true,
    wasPaused: false,
  });
});

describe('useTransportStore', () => {
  it('play 시 isPlaying true', () => {
    useTransportStore.getState().play();
    expect(useTransportStore.getState().isPlaying).toBe(true);
  });

  it('첫 번째 stop: 현재 위치에서 일시정지', () => {
    useTransportStore.getState().play();
    useTransportStore.getState().updateCurrentTick(500);
    useTransportStore.getState().stop();
    expect(useTransportStore.getState().isPlaying).toBe(false);
    expect(useTransportStore.getState().currentTick).toBe(500);
    expect(useTransportStore.getState().wasPaused).toBe(true);
  });

  it('두 번째 stop: 처음으로 이동', () => {
    useTransportStore.getState().play();
    useTransportStore.getState().updateCurrentTick(500);
    useTransportStore.getState().stop();  // pause
    useTransportStore.getState().stop();  // go to 0
    expect(useTransportStore.getState().currentTick).toBe(0);
    expect(useTransportStore.getState().wasPaused).toBe(false);
  });

  it('정지 상태에서 stop은 무시', () => {
    useTransportStore.getState().stop();
    expect(useTransportStore.getState().currentTick).toBe(0);
    expect(useTransportStore.getState().wasPaused).toBe(false);
  });

  it('메트로놈 토글', () => {
    expect(useTransportStore.getState().isMetronomeOn).toBe(true);
    useTransportStore.getState().toggleMetronome();
    expect(useTransportStore.getState().isMetronomeOn).toBe(false);
  });

  it('위치 설정', () => {
    useTransportStore.getState().setPosition(1000);
    expect(useTransportStore.getState().currentTick).toBe(1000);
  });

  it('음수 위치 방지', () => {
    useTransportStore.getState().setPosition(-100);
    expect(useTransportStore.getState().currentTick).toBe(0);
  });
});
