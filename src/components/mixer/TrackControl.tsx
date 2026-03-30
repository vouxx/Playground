'use client';

interface TrackControlProps {
  volume: number;
  mute: boolean;
  solo: boolean;
  onVolumeChange: (volume: number) => void;
  onToggleMute: () => void;
  onToggleSolo: () => void;
}

export default function TrackControl({
  volume,
  mute,
  solo,
  onVolumeChange,
  onToggleMute,
  onToggleSolo,
}: TrackControlProps) {
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="range"
        min={0}
        max={100}
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        className="h-1 w-16 cursor-pointer accent-blue-500"
        aria-label="볼륨"
      />

      <button
        onClick={onToggleMute}
        className={`h-6 w-6 rounded text-xs font-bold transition-colors ${
          mute
            ? 'bg-red-500 text-white'
            : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
        }`}
        aria-label={mute ? '뮤트 해제' : '뮤트'}
      >
        M
      </button>

      <button
        onClick={onToggleSolo}
        className={`h-6 w-6 rounded text-xs font-bold transition-colors ${
          solo
            ? 'bg-yellow-500 text-white'
            : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600'
        }`}
        aria-label={solo ? '솔로 해제' : '솔로'}
      >
        S
      </button>
    </div>
  );
}
