import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface OdometerSliderProps {
  odometerKm: number;
  tripAKm: number;
  avgSpeedKmh: number;
  mode: 'ODO' | 'TRIP_A' | 'AVG_SPEED';
  onChangeMode: (mode: 'ODO' | 'TRIP_A' | 'AVG_SPEED') => void;
}

export const OdometerSlider: React.FC<OdometerSliderProps> = ({
  odometerKm,
  tripAKm,
  avgSpeedKmh,
  mode,
  onChangeMode,
}) => {
  const modes: ('ODO' | 'TRIP_A' | 'AVG_SPEED')[] = ['ODO', 'TRIP_A', 'AVG_SPEED'];

  const handlePrev = () => {
    const currentIndex = modes.indexOf(mode);
    const prevIndex = (currentIndex - 1 + modes.length) % modes.length;
    onChangeMode(modes[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = modes.indexOf(mode);
    const nextIndex = (currentIndex + 1) % modes.length;
    onChangeMode(modes[nextIndex]);
  };

  return (
    <div className="flex items-center gap-3 select-none text-slate-400 z-10">
      <button
        onClick={handlePrev}
        className="p-1 hover:text-white transition-colors cursor-pointer"
        title="Previous Trip Metric"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
      </button>

      <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase font-mono">
        {mode === 'ODO' && (
          <>
            <span className="text-slate-400">ODO</span>
            <span className="text-slate-100 font-bold">{odometerKm} km</span>
          </>
        )}
        {mode === 'TRIP_A' && (
          <>
            <span className="text-slate-400">TRIP A</span>
            <span className="text-slate-100 font-bold">{tripAKm.toFixed(1)} km</span>
          </>
        )}
        {mode === 'AVG_SPEED' && (
          <>
            <span className="text-slate-400">AVG SPEED</span>
            <span className="text-slate-100 font-bold">{avgSpeedKmh} km/h</span>
          </>
        )}
      </div>

      <button
        onClick={handleNext}
        className="p-1 hover:text-white transition-colors cursor-pointer"
        title="Next Trip Metric"
      >
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
