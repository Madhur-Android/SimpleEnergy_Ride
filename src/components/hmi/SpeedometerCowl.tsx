import React, { useEffect, useRef } from 'react';

interface SpeedometerCowlProps {
  speedKmh: number;
  isSpeedValid: boolean;
  rapidBrake: boolean;
  isOverSpeed: boolean;
  rideMode: string;
}

export const SpeedometerCowl: React.FC<SpeedometerCowlProps> = ({
  speedKmh,
  isSpeedValid,
  rapidBrake,
  isOverSpeed,
  rideMode,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Animated speed value for smooth needle/bar interpolation
  const currentSpeed = isSpeedValid ? Math.max(0, speedKmh) : 0;
  const isHighSpeed = currentSpeed >= 80;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let tick = 0;

    const render = () => {
      tick++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Speed percentage normalized to 0..100 km/h max baseline
      const speedRatio = Math.min(1, Math.max(0.08, currentSpeed / 100));

      // 1. Thruster visualization for speeds > 80 km/h (Item 24)
      if (isHighSpeed) {
        ctx.save();
        const thrusterY = height * 0.72;
        const thrusterWidth = width * 0.45;
        const startX = (width - thrusterWidth) / 2;

        for (let i = 0; i < 18; i++) {
          const particleOffset = ((tick * 4 + i * 25) % 180);
          const pAlpha = Math.max(0, 1 - particleOffset / 180) * 0.6;
          const pWidth = 3 + (i % 3);

          ctx.fillStyle = `rgba(255, 60, 0, ${pAlpha})`;
          ctx.fillRect(
            startX + (i * (thrusterWidth / 18)),
            thrusterY + particleOffset * 0.35,
            pWidth,
            12 + (particleOffset * 0.1)
          );
        }
        ctx.restore();
      }

      // 2. Regen indication with flowing dots (Item 25)
      if (rapidBrake || (currentSpeed > 5 && currentSpeed < 30)) {
        ctx.save();
        const regenY = height * 0.78;
        const dotSpacing = width * 0.05;
        for (let i = 0; i < 12; i++) {
          const dotPhase = (tick * 0.08 + i * 0.5) % Math.PI;
          const dotAlpha = Math.sin(dotPhase) * 0.7;
          ctx.fillStyle = `rgba(0, 230, 118, ${Math.max(0, dotAlpha)})`;
          ctx.beginPath();
          ctx.arc(
            width * 0.22 + i * dotSpacing,
            regenY + Math.sin(tick * 0.05 + i) * 3,
            2.5,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.restore();
      }

      // 3. 3D Sculpted aerodynamic cowl body (Item 23)
      ctx.save();

      // Cowl base contour
      ctx.beginPath();
      ctx.moveTo(width * 0.08, height * 0.78);
      // Left shoulder curve
      ctx.bezierCurveTo(
        width * 0.22, height * 0.74,
        width * 0.30, height * 0.52,
        width * 0.42, height * 0.50
      );
      // Center bridge
      ctx.lineTo(width * 0.58, height * 0.50);
      // Right shoulder curve
      ctx.bezierCurveTo(
        width * 0.70, height * 0.52,
        width * 0.78, height * 0.74,
        width * 0.92, height * 0.78
      );
      // Bottom lip
      ctx.lineTo(width * 0.95, height * 0.88);
      ctx.bezierCurveTo(
        width * 0.75, height * 0.82,
        width * 0.25, height * 0.82,
        width * 0.05, height * 0.88
      );
      ctx.closePath();

      // Cowl metallic dark fill with ambient reflection
      const cowlGradient = ctx.createLinearGradient(0, height * 0.45, 0, height * 0.9);
      cowlGradient.addColorStop(0, '#262a33');
      cowlGradient.addColorStop(0.3, '#181b22');
      cowlGradient.addColorStop(0.7, '#101216');
      cowlGradient.addColorStop(1, '#08090b');
      ctx.fillStyle = cowlGradient;
      ctx.fill();

      // Subtle metallic highlight stroke
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Intake grille vertical ribs pattern on lower cowl
      const ribCount = 38;
      const ribStartX = width * 0.16;
      const ribEndX = width * 0.84;
      const ribStep = (ribEndX - ribStartX) / ribCount;

      for (let r = 0; r < ribCount; r++) {
        const rx = ribStartX + r * ribStep;
        const normDistFromCenter = Math.abs(rx - width * 0.5) / (width * 0.35);
        if (normDistFromCenter < 1) {
          const ribHeight = (1 - normDistFromCenter * 0.6) * 14;
          const ry = height * 0.68 + normDistFromCenter * 4;

          ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
          ctx.fillRect(rx, ry, 2.5, ribHeight);

          // Subtle reflection edge
          ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
          ctx.fillRect(rx + 2.5, ry, 1, ribHeight);
        }
      }

      // 4. Luminous Speedometer Lightbar on Cowl Crest
      // The lightbar widens dynamically with speed
      const barY = height * 0.63;
      const maxHalfWidth = width * 0.36;
      const currentHalfWidth = maxHalfWidth * speedRatio;
      const centerX = width * 0.5;

      // Color scheme transitions from amber to vibrant sonic red
      let neonColor = '#ff8800';
      let glowColor = 'rgba(255, 136, 0, 0.5)';
      if (isHighSpeed || rideMode === 'SONIC') {
        neonColor = '#ff3d00';
        glowColor = 'rgba(255, 61, 0, 0.65)';
      } else if (currentSpeed > 50) {
        neonColor = '#ff9800';
        glowColor = 'rgba(255, 152, 0, 0.5)';
      } else if (currentSpeed === 0) {
        neonColor = '#ff7700';
        glowColor = 'rgba(255, 119, 0, 0.3)';
      }

      // Wide ambient bloom glow
      ctx.save();
      ctx.shadowColor = neonColor;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - currentHalfWidth, barY);
      ctx.lineTo(centerX + currentHalfWidth, barY);
      ctx.stroke();
      ctx.restore();

      // Sharp intense core LED bar
      ctx.save();
      ctx.strokeStyle = neonColor;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(centerX - currentHalfWidth, barY);
      ctx.lineTo(centerX + currentHalfWidth, barY);
      ctx.stroke();

      // Inner white-hot filament center
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX - currentHalfWidth * 0.7, barY);
      ctx.lineTo(centerX + currentHalfWidth * 0.7, barY);
      ctx.stroke();
      ctx.restore();

      // 5. Shoulder warning blinkers (Item 21: rapid brake & harsh acceleration)
      const blinkerY = height * 0.55;
      const leftBlinkerX = width * 0.24;
      const rightBlinkerX = width * 0.76;

      if (rapidBrake || isOverSpeed) {
        const blinkPhase = Math.sin(tick * 0.3) > 0;
        if (blinkPhase) {
          ctx.save();
          ctx.fillStyle = '#ff1744';
          ctx.shadowColor = '#ff1744';
          ctx.shadowBlur = 15;

          // Left shoulder blinker bar
          ctx.fillRect(leftBlinkerX, blinkerY, 24, 5);
          // Right shoulder blinker bar
          ctx.fillRect(rightBlinkerX - 24, blinkerY, 24, 5);
          ctx.restore();
        }
      } else {
        // Idle subtle red lens
        ctx.fillStyle = 'rgba(255, 23, 68, 0.4)';
        ctx.fillRect(leftBlinkerX, blinkerY, 20, 3);
        ctx.fillRect(rightBlinkerX - 20, blinkerY, 20, 3);
      }

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [currentSpeed, isHighSpeed, rapidBrake, isOverSpeed, rideMode]);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none">
      {/* 3D Cowl Canvas Background */}
      <canvas
        ref={canvasRef}
        width={920}
        height={320}
        className="w-full max-w-[880px] h-[220px] sm:h-[260px] object-contain pointer-events-none"
      />

      {/* Item 20: Speedometer Value Overlay */}
      <div className="absolute top-[28%] sm:top-[24%] flex flex-col items-center justify-center pointer-events-none">
        <div className="flex items-baseline tracking-tight">
          <span
            className={`font-black tracking-tighter font-mono-nums transition-colors duration-200 ${
              !isSpeedValid
                ? 'text-red-400 text-6xl sm:text-7xl'
                : 'text-white text-7xl sm:text-8xl md:text-9xl drop-shadow-[0_8px_24px_rgba(0,0,0,0.9)]'
            }`}
          >
            {isSpeedValid ? Math.round(currentSpeed) : '---'}
          </span>
        </div>

        <span className="text-xs sm:text-sm font-semibold tracking-widest uppercase text-slate-400 -mt-1 sm:-mt-2">
          km / h
        </span>

        {!isSpeedValid && (
          <span className="mt-1 px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-red-300 text-[10px] font-bold tracking-wide animate-pulse">
            FAULT: SENSOR CORRUPTED
          </span>
        )}
      </div>
    </div>
  );
};
