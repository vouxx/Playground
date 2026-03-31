'use client';

import { useEffect } from 'react';
import { useTransport } from './useTransport';

/**
 * 전역 키보드 단축키
 * - Space: 재생/정지 토글
 * - Home: 처음으로 이동
 */
export function useKeyboardShortcuts() {
  const { handleTogglePlayStop, handleStop } = useTransport();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // input/textarea 내부에서는 무시
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlayStop();
      }

      if (e.key === 'Home') {
        e.preventDefault();
        handleStop();
        handleStop(); // double stop → go to 0
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTogglePlayStop, handleStop]);
}
