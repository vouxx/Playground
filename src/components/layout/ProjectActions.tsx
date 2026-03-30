'use client';

import { useState } from 'react';
import { saveProject, loadProject, encodeProjectToUrl } from '@/lib/storage';

export default function ProjectActions() {
  const [message, setMessage] = useState('');

  const handleSave = () => {
    saveProject();
    setMessage('저장됨!');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleLoad = () => {
    const ok = loadProject();
    setMessage(ok ? '불러옴!' : '저장된 프로젝트 없음');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleShare = async () => {
    const url = encodeProjectToUrl();
    await navigator.clipboard.writeText(url);
    setMessage('URL 복사됨!');
    setTimeout(() => setMessage(''), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={handleSave} className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">Save</button>
      <button onClick={handleLoad} className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">Load</button>
      <button onClick={handleShare} className="rounded bg-zinc-100 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700">Share</button>
      {message && <span className="text-xs text-green-500">{message}</span>}
    </div>
  );
}
