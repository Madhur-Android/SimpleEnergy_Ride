import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Navigation,
  Music,
  Power,
  BatteryCharging,
  Wrench,
  Gauge,
  CircleAlert,
  ArrowLeft,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { MotorStatus, KillSwitchStatus } from '../../types/vehicle';

interface BottomActionBarProps {
  motorStatus: MotorStatus;
  killSwitchStatus: KillSwitchStatus;
  socPercent: number;
  highBeam: boolean;
  sideStand: boolean;
  leftIndicator: boolean;
  rightIndicator: boolean;
  serviceDue: boolean;
  tractionControl: boolean;
  tpmsOk: boolean;
  onToggleMotor: () => void;
  onToggleKillSwitch: () => void;
  onToggleHighBeam: () => void;
  onToggleSideStand: () => void;
  onToggleLeftIndicator: () => void;
  onToggleRightIndicator: () => void;
}

export const BottomActionBar: React.FC<BottomActionBarProps> = ({
  motorStatus,
  killSwitchStatus,
  socPercent,
  highBeam,
  sideStand,
  leftIndicator,
  rightIndicator,
  serviceDue,
  tractionControl,
  tpmsOk,
  onToggleMotor,
  onToggleKillSwitch,
  onToggleHighBeam,
  onToggleSideStand,
  onToggleLeftIndicator,
  onToggleRightIndicator,
}) => {
  const [blinkTick, setBlinkTick] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setBlinkTick((prev) => !prev);
    }, 400);
    return () => clearInterval(timer);
  }, []);

  const isMotorOn = motorStatus === 'ON' && killSwitchStatus !== 'ACTIVE';
  const isKillSwitchActive = killSwitchStatus === 'ACTIVE';

  return (
    <div className="w-full flex items-center justify-between px-2 sm:px-4 py-2 select-none z-20 border-t border-white/5 bg-gradient-to-t from-black via-black/80 to-transparent">
      {/* Left App Launchers: Items 26, 27, Music */}
      <div className="flex items-center gap-2">
        {/* Item 26: Settings Menu */}
        <button
          className="w-10 h-10 rounded-full bg-[#181a20] hover:bg-[#252832] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
          title="App Menu"
        >
          <LayoutGrid className="w-4 h-4" />
        </button>

        {/* Item 27: Maps Navigation */}
        <button
          className="w-10 h-10 rounded-full bg-[#181a20] hover:bg-[#252832] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
          title="Turn-by-turn Navigation"
        >
          <Navigation className="w-4 h-4" />
        </button>

        {/* Music Player */}
        <button
          className="w-10 h-10 rounded-full bg-[#181a20] hover:bg-[#252832] border border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all active:scale-95 shadow-md"
          title="Media Player"
        >
          <Music className="w-4 h-4" />
        </button>
      </div>

      {/* Center Automotive Tell-Tales / Indicators: Items 28-34 */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 py-1.5 rounded-full bg-black/60 border border-white/5">
        {/* Item 28: High beam */}
        <button
          onClick={onToggleHighBeam}
          className={`cursor-pointer transition-colors ${
            highBeam ? 'text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]' : 'text-slate-600 hover:text-slate-400'
          }`}
          title="High Beam (Click to toggle)"
        >
          <span className="font-mono text-sm font-black">≡D</span>
        </button>

        {/* Item 29: Side Stand */}
        <button
          onClick={onToggleSideStand}
          className={`cursor-pointer transition-colors ${
            sideStand ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'text-slate-600 hover:text-slate-400'
          }`}
          title="Side Stand (Click to toggle)"
        >
          <span className="text-xs font-bold font-mono">⑂</span>
        </button>

        {/* Item 30: Left Indicator */}
        <button
          onClick={onToggleLeftIndicator}
          className={`cursor-pointer transition-all ${
            leftIndicator && blinkTick
              ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,1)] scale-110'
              : leftIndicator
              ? 'text-emerald-950'
              : 'text-slate-600 hover:text-slate-400'
          }`}
          title="Left Indicator (Click to toggle)"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Item 31: Service Due */}
        <div
          className={serviceDue ? 'text-orange-400 animate-pulse' : 'text-slate-600'}
          title="Service / Maintenance"
        >
          <Wrench className="w-3.5 h-3.5" />
        </div>

        {/* Item 32: Traction Control */}
        <div
          className={tractionControl ? 'text-emerald-400' : 'text-slate-600'}
          title="Traction Control Active"
        >
          <Gauge className="w-3.5 h-3.5" />
        </div>

        {/* Item 33: Right Indicator */}
        <button
          onClick={onToggleRightIndicator}
          className={`cursor-pointer transition-all ${
            rightIndicator && blinkTick
              ? 'text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,1)] scale-110'
              : rightIndicator
              ? 'text-emerald-950'
              : 'text-slate-600 hover:text-slate-400'
          }`}
          title="Right Indicator (Click to toggle)"
        >
          <ArrowRight className="w-4 h-4" />
        </button>

        {/* Item 34: TPMS */}
        <div
          className={tpmsOk ? 'text-slate-400' : 'text-red-400 animate-pulse'}
          title="Tyre Pressure Monitoring System (TPMS)"
        >
          <span className="text-[10px] font-black border border-current px-1 py-0.2 rounded-xs">
            ( ! )
          </span>
        </div>
      </div>

      {/* Right zone: Battery Pill + MANDATORY MOTOR & KILL SWITCH STATUS */}
      <div className="flex items-center gap-2.5">
        {/* Item 35: Battery pill with Battery SOC */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          <BatteryCharging className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-xs text-emerald-300 font-mono tracking-tight">
            {socPercent}%
          </span>
        </div>

        {/* MANDATORY REQUIREMENT: Kill-Switch Status Pill */}
        <button
          onClick={onToggleKillSwitch}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-black tracking-wider uppercase transition-all duration-300 active:scale-95 shadow-md ${
            isKillSwitchActive
              ? 'bg-red-950/90 border-red-500 text-red-300 shadow-[0_0_16px_rgba(239,68,68,0.7)] animate-pulse'
              : 'bg-[#181a20] border-white/10 text-slate-400 hover:text-slate-200'
          }`}
          title="Kill-Switch Status: Click to toggle safety cut-off"
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${isKillSwitchActive ? 'text-red-400' : 'text-slate-400'}`} />
          <span>{isKillSwitchActive ? 'KILL SW ACTIVE' : 'KILL SW SAFE'}</span>
        </button>

        {/* MANDATORY REQUIREMENT: Item 36 Motor Status */}
        <button
          onClick={onToggleMotor}
          disabled={isKillSwitchActive}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-black tracking-wider transition-all duration-300 shadow-md ${
            isKillSwitchActive
              ? 'bg-zinc-900 border-zinc-700 text-zinc-500 cursor-not-allowed opacity-60'
              : isMotorOn
              ? 'bg-gradient-to-r from-emerald-950 to-emerald-900 border-emerald-500 text-emerald-300 shadow-[0_0_16px_rgba(16,185,129,0.5)] active:scale-95'
              : 'bg-zinc-900 hover:bg-zinc-800 border-white/10 text-slate-400 hover:text-slate-200 active:scale-95'
          }`}
          title={
            isKillSwitchActive
              ? 'Motor Disabled: Disengage Kill Switch first'
              : `Motor Status: ${motorStatus} (Click to toggle)`
          }
        >
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
              isMotorOn
                ? 'bg-emerald-400 text-black shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                : 'bg-zinc-700 text-zinc-400'
            }`}
          >
            <Power className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span className="uppercase font-mono font-bold tracking-widest">
            {isMotorOn ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>
    </div>
  );
};
