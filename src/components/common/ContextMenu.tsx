'use client';

import { useEffect, useRef } from 'react';

export interface MenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: MenuItem[];
  onClose: () => void;
}

export default function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="fixed z-50 min-w-[140px] rounded-md border border-zinc-600 bg-zinc-800 py-1 shadow-lg"
      style={{ left: x, top: y }}
    >
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`block w-full px-3 py-1.5 text-left text-sm hover:bg-zinc-700 ${
            item.danger ? 'text-red-400' : 'text-zinc-200'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
