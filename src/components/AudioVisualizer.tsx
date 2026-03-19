"use client";

import React, { useRef, useEffect } from 'react';

export function AudioVisualizer({ audioBuffer, color = "#D4AF37", label }: { audioBuffer?: AudioBuffer, color?: string, label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!audioBuffer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / canvas.width);
    const amp = canvas.height / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, amp);

    for (let i = 0; i < canvas.width; i++) {
      let min = 1.0;
      let max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[(i * step) + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }
      ctx.lineTo(i, (1 + min) * amp);
      ctx.lineTo(i, (1 + max) * amp);
    }
    ctx.stroke();
  }, [audioBuffer, color]);

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>}
      <canvas ref={canvasRef} width={400} height={60} className="w-full h-[60px] bg-black/20 rounded-md" />
    </div>
  );
}
