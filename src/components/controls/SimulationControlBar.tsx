import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  Radio,
  FileCode2,
  CheckCircle2,
  BookOpen,
  Sliders,
  Tv,
} from 'lucide-react';
import { ScenarioType, VehicleUiState } from '../../types/vehicle';
import { simulationEngine } from '../../services/simulationEngine';

interface SimulationControlBarProps {
  uiState: VehicleUiState;
  onOpenCodeModal: () => void;
  onOpenTestModal: () => void;
  onOpenDocsModal: () => void;
}

export const SimulationControlBar: React.FC<SimulationControlBarProps> = ({
  uiState,
  onOpenCodeModal,
  onOpenTestModal,
  onOpenDocsModal,
}) => {
  const scenarios: { id: ScenarioType; label: string; badge: string }[] = [
    { id: 'PARKED', label: 'Parked', badge: '0 km/h • OFF' },
    { id: 'READY', label: 'Ready', badge: '0 km/h • ON' },
    { id: 'RIDING', label: 'Riding', badge: '25 km/h • ON' },
    { id: 'ACCELERATING', label: 'Accelerating', badge: '74 km/h • SONIC' },
    { id: 'MOTOR_DISABLED', label: 'Motor Disabled', badge: 'Kill Switch' },
  ];

  return (
    <div className="w-full bg-[#12141a] border-t border-white/10 px-4 py-3 select-none z-30">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Simulation Flow Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Play/Pause Auto Flow button */}
          <button
            onClick={() => simulationEngine.setAutoPlay(!uiState.isAutoPlaying)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 shadow-md ${
              uiState.isAutoPlaying
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700 text-slate-300'
            }`}
            title="Auto-loop simulated vehicle data with 1-second ticks"
          >
            {uiState.isAutoPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Auto Loop (~1Hz)</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Auto Loop</span>
              </>
            )}
          </button>

          {/* 5 Mandatory Scenarios Quick Selector */}
          <div className="flex items-center gap-1 bg-black/50 p-1 rounded-lg border border-white/5 overflow-x-auto">
            {scenarios.map((sc) => {
              const isActive = uiState.currentScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => simulationEngine.applyScenario(sc.id)}
                  className={`px-2.5 py-1 rounded text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-black shadow-sm font-bold'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  title={sc.badge}
                >
                  {sc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Center: Edge Cases & Fault Injectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Edge Case 1: Negative Speed */}
          <button
            onClick={() => simulationEngine.applyScenario('FAULT_NEGATIVE_SPEED')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              uiState.currentScenario === 'FAULT_NEGATIVE_SPEED'
                ? 'bg-red-950 border-red-500 text-red-300'
                : 'bg-black/40 hover:bg-red-950/40 border-red-500/30 text-red-400'
            }`}
            title="Edge Case 1: Injects corrupted negative speed (-15 km/h). Shows safe fallback '---' without crashing."
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fault: Neg Speed</span>
          </button>

          {/* Edge Case 2: Stale Telemetry */}
          <button
            onClick={() => simulationEngine.applyScenario('FAULT_STALE_DATA')}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              uiState.isDataStale
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-black/40 hover:bg-amber-950/40 border-amber-500/30 text-amber-400'
            }`}
            title="Edge Case 2: Simulates CAN heartbeat loss (>2.5s). Triggers stale warning banner."
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Fault: Stale CAN</span>
          </button>

          {/* Rapid Brake trigger */}
          <button
            onClick={() => simulationEngine.triggerRapidBrake()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-black/40 hover:bg-zinc-800 border border-white/10 text-slate-300"
            title="Trigger hard deceleration & rapid brake warning"
          >
            <span>Brake Decel</span>
          </button>

          {/* Throttle Slider */}
          <div className="flex items-center gap-2 bg-black/50 px-3 py-1 rounded-lg border border-white/5">
            <span className="text-[11px] text-slate-400 font-mono">Throttle:</span>
            <input
              type="range"
              min="0"
              max="105"
              value={uiState.isSpeedValid ? Math.max(0, uiState.telemetry.speedKmh) : 0}
              onChange={(e) => simulationEngine.setManualSpeed(Number(e.target.value))}
              className="w-24 accent-emerald-500 h-1.5 cursor-pointer"
            />
            <span className="text-[11px] text-emerald-400 font-mono font-bold w-12 text-right">
              {uiState.isSpeedValid ? `${Math.round(uiState.telemetry.speedKmh)} km/h` : 'ERR'}
            </span>
          </div>
        </div>

        {/* Right: Submission & Android Studio Navigation Buttons */}
        <div className="flex items-center gap-2">
          {/* Bezel Toggle */}
          <button
            onClick={() => simulationEngine.toggleBezel()}
            className={`p-1.5 rounded-lg border transition-colors ${
              uiState.showBezel
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-zinc-800 border-white/10 text-slate-400'
            }`}
            title="Toggle 7-inch Automotive Bezel frame"
          >
            <Tv className="w-4 h-4" />
          </button>

          {/* Unit Test Runner Modal */}
          <button
            onClick={onOpenTestModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 transition-all active:scale-95"
            title="View & Run 7 JUnit 4 Unit Tests"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Unit Tests</span>
          </button>

          {/* Android Studio Code & ZIP Export */}
          <button
            onClick={onOpenCodeModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-black font-extrabold shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
            title="Inspect Android Studio project & Download full .ZIP"
          >
            <FileCode2 className="w-3.5 h-3.5 text-black" />
            <span>Android Studio Code & ZIP</span>
          </button>

          {/* Architecture / README */}
          <button
            onClick={onOpenDocsModal}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 border border-white/10 text-slate-300"
            title="Assignment Architecture & README"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
