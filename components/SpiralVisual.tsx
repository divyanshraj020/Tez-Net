
import React, { useEffect, useRef } from 'react';
import { TestStage } from '../types';

interface SpiralVisualProps {
  value: number;
  stage: TestStage;
}

const SpiralVisual: React.FC<SpiralVisualProps> = ({ value, stage }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const angleRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Speed determines rotation velocity
      // Base rotation + additional based on Mbps
      const rotationSpeed = stage === 'idle' ? 0.01 : 0.02 + (value / 500);
      angleRef.current += rotationSpeed;

      const lines = 3;
      const iterations = 150;
      
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';

      for (let l = 0; l < lines; l++) {
        ctx.beginPath();
        const lineOffset = (l * Math.PI * 2) / lines;
        
        for (let i = 0; i < iterations; i++) {
          const angle = 0.1 * i + angleRef.current + lineOffset;
          const dist = i * (canvas.width / 350);
          const x = centerX + Math.cos(angle) * dist;
          const y = centerY + Math.sin(angle) * dist;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        // Color transition based on stage
        const color = stage === 'upload' ? '#f97316' : '#0d9488';
        ctx.strokeStyle = color;
        ctx.globalAlpha = 1 - (l * 0.2);
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [stage, value]);

  return (
    <div className="relative flex items-center justify-center w-[300px] h-[300px]">
      <canvas 
        ref={canvasRef} 
        width={600} 
        height={600} 
        className="w-full h-full drop-shadow-[0_0_20px_rgba(13,148,136,0.3)]"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-black text-white font-mono tracking-tighter drop-shadow-lg italic">
          {stage === 'idle' ? '0.0' : value.toFixed(1)}
        </span>
        <span className="text-teal-400 font-black tracking-[0.3em] text-[10px] mt-1 uppercase">
          Mbps
        </span>
      </div>
    </div>
  );
};

export default SpiralVisual;
