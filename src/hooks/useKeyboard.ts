'use client';

import { useEffect } from 'react';
import { useSequencerStore } from '@/store/useSequencerStore';

interface KeyboardActions {
  onPlayToggle: () => void;
}

export function useKeyboard({ onPlayToggle }: KeyboardActions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onPlayToggle();
          break;
        case 'Backspace':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            useSequencerStore.getState().clearPattern();
          }
          break;
        case 'KeyZ':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) {
              useSequencerStore.getState().redo();
            } else {
              useSequencerStore.getState().undo();
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPlayToggle]);
}
