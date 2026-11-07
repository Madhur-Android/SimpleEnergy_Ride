import React, { useState } from 'react';

interface ParkingSliderProps {
  isParked: boolean;
  onTogglePark: () => void;
}

export const ParkingSlider: React.FC<ParkingSliderProps> = ({ isParked, onTogglePark }) => {
  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 select-none z-10 hidden sm:flex">
      <button
        onClick={onTogglePark}
        className={`group flex items-center justify-center py-6 px-1.5 rounded-r-xl border border-l-0 transition-all duration-300 shadow-xl ${
          isParked
            ? 'bg-amber-950/80 border-amber-500/60 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
            : 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-slate-400 hover:text-slate-200'
        }`}
        title="Parking Assist Mode"
      >
        <div className="flex flex-col items-center gap-2">
          <span
            className="text-[9px] font-black uppercase tracking-[0.25em] writing-mode-vertical rotate-180"
            style={{ writingMode: 'vertical-rl' }}
          >
            PARKING »
          </span>
          <div className="flex flex-col gap-1 items-center">
            <span className="w-1 h-3 rounded-full bg-slate-500/50 group-hover:bg-slate-300" />
            <span className="w-1 h-3 rounded-full bg-slate-500/50 group-hover:bg-slate-300" />
            <span className="w-1 h-3 rounded-full bg-slate-500/50 group-hover:bg-slate-300" />
          </div>
        </div>
      </button>
    </div>
  );
};
