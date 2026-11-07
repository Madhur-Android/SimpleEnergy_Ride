import React from 'react';
import { Zap, Gauge, AlertCircle } from 'lucide-react';

interface AlertStackProps {
  rapidBrake: boolean;
  superHold: boolean;
  speedKmh: number;
  cruiseControlActive: boolean;
  cruiseSpeedKmh: number;
}

export const AlertStack: React.FC<AlertStackProps> = ({
  rapidBrake,
  superHold,
  speedKmh,
  cruiseControlActive,
  cruiseSpeedKmh,
}) => {
  const isOverSpeed = speedKmh >= 80;

  return (
    <div className="flex flex-col items-end gap-2.5 select-none pointer-events-none z-10 w-44 sm:w-48">
      {/* Item 14: Rapid Brake Alert */}
      <div
        className={`flex items-center gap-2.5 transition-all duration-300 ${
          rapidBrake ? 'opacity-100 scale-100' : 'opacity-25 scale-95'
        }`}
      >
        <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-500 shadow-[0_0_12px_rgba(239,68,68,0.4)]">
          <Zap className="w-4 h-4 fill-red-500" />
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[11px] font-black tracking-wider text-red-400 uppercase leading-tight">
            Rapid
          </span>
          <span className="text-[10px] font-bold tracking-wider text-red-500 uppercase leading-tight">
            Brake
          </span>
        </div>
      </div>

      {/* Item 15: SuperHold (Hill hold brake) */}
      <div
        className={`flex items-center justify-center px-3 py-1.5 rounded-full border transition-all duration-300 ${
          superHold
            ? 'bg-cyan-950/80 border-cyan-400/60 shadow-[0_0_14px_rgba(6,182,212,0.4)] opacity-100'
            : 'bg-slate-900/40 border-white/5 opacity-30'
        }`}
      >
        <div className="flex items-center gap-1.5">
          <span className="text-cyan-400 text-xs font-mono font-black">((</span>
          <span className="text-[10px] font-black tracking-widest text-cyan-300 uppercase">
            SUPER HOLD
          </span>
          <span className="text-cyan-400 text-xs font-mono font-black">))</span>
        </div>
      </div>

      {/* Item 16: OverSpeed / Speed Exceeded (80 km/h) */}
      <div
        className={`flex items-center gap-2.5 transition-all duration-300 ${
          isOverSpeed ? 'opacity-100 scale-100 animate-pulse' : 'opacity-25 scale-95'
        }`}
      >
        <div className="w-8 h-8 rounded-full border-2 border-red-500 bg-black/80 flex flex-col items-center justify-center text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]">
          <span className="text-[10px] font-black leading-none font-mono">80</span>
          <span className="text-[6px] uppercase tracking-tighter text-slate-300">km/h</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] font-black tracking-tight text-red-400 uppercase leading-tight">
            Speed
          </span>
          <span className="text-[9px] font-bold tracking-tight text-red-500 uppercase leading-tight">
            Exceeded
          </span>
        </div>
      </div>

      {/* Item 17: Cruise Control */}
      <div
        className={`flex items-center gap-2.5 px-2.5 py-1 rounded-full border transition-all duration-300 ${
          cruiseControlActive
            ? 'bg-emerald-950/80 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.35)] opacity-100'
            : 'bg-slate-900/40 border-white/5 opacity-30'
        }`}
      >
        <Gauge className="w-4 h-4 text-emerald-400" />
        <div className="flex flex-col text-right">
          <span className="text-[9px] font-bold text-emerald-400 uppercase leading-tight">
            Active
          </span>
          <span className="text-[11px] font-black text-white font-mono leading-tight">
            {cruiseSpeedKmh} km/h
          </span>
        </div>
      </div>
    </div>
  );
};
