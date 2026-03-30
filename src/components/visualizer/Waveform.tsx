'use client';

import { useEffect, useRef } from 'react';
import * as Tone from 'tone';

export default function Waveform() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyserRef = useRef<Tone.Analyser | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const analyser = new Tone.Analyser('waveform', 256);
    Tone.getDestination().connect(analyser);
    analyserRef.current = analyser;

    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const values = analyser.getValue() as Float32Array;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();

      for (let i = 0; i < values.length; i++) {
        const x = (i / values.length) * w;
        const y = ((values[i] + 1) / 2) * h;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      Tone.getDestination().disconnect(analyser);
      analyser.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={60}
      className="w-full max-w-md rounded-lg border border-zinc-200 bg-zinc-950 dark:border-zinc-700"
    />
  );
}
