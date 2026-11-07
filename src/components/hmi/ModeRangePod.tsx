import React from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { RideMode } from '../../types/vehicle';

interface ModeRangePodProps {
  rideMode: RideMode;
  rangeKm: number;
  socPercent: number;
  onCycleMode?: () => void;
}

export const ModeRangePod: React.FC<ModeRangePodProps> = ({
  rideMode,
  rangeKm,
  socPercent,
  onCycleMode,
}) => {
  const getModeColor = (mode: RideMode) => {
    switch (mode) {
      case 'SONIC':
        return {
          bg: 'bg-orange-600',
          text: 'text-white',
          border: 'border-orange-500/50',
          glow: 'shadow-[0_0_15px_rgba(234,88,12,0.4)]',
        };
      case 'RIDE':
        return {
          bg: 'bg-sky-600',
          text: 'text-white',
          border: 'border-sky-500/50',
          glow: 'shadow-[0_0_15px_rgba(2,132,199,0.4)]',
        };
      case 'ECO':
      default:
        return {
          bg: 'bg-emerald-950/90',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]',
        };
    }
  };

  const modeStyle = getModeColor(rideMode);

  return (
    <div className="relative flex flex-col items-center select-none z-10">
      {/* Pod Body */}
      <div
        onClick={onCycleMode}
        className="cursor-pointer group relative flex flex-col items-center min-w-[280px] sm:min-w-[320px] bg-gradient-to-b from-[#252830] via-[#1c1e24] to-[#121418] rounded-2xl border border-white/10 shadow-[0_12px_30px_rgba(0,0,0,0.8)] overflow-hidden transition-transform active:scale-98"
        title="Click to cycle Ride Mode (ECO -> RIDE -> SONIC)"
      >
        {/* Item 11: Alternate battery SOC visual bar indication */}
        <div className="w-full h-1.5 bg-slate-800/80 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.8)] transition-all duration-500"
            style={{ width: `${socPercent}%` }}
          />
        </div>

        {/* Content row: Mode Badge | Energy Arrows | Range */}
        <div className="w-full flex items-center justify-between px-5 py-2.5">
          {/* Item 18: Ride mode pill */}
          <div
            className={`flex items-center justify-center px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase transition-all duration-300 border ${modeStyle.bg} ${modeStyle.text} ${modeStyle.border} ${modeStyle.glow}`}
          >
            {rideMode}
          </div>

          {/* Bidirectional arrows */}
          <div className="flex items-center text-slate-400 group-hover:text-slate-200 transition-colors">
            <ArrowLeftRight className="w-4 h-4 opacity-75" />
          </div>

          {/* Item 19: Range as per SOC and mode */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white tracking-tight font-mono-nums">
              {rangeKm}
            </span>
            <div className="flex flex-col text-[10px] leading-tight text-slate-400 font-medium">
              <span className="text-slate-300 font-bold">km</span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400">Range</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
