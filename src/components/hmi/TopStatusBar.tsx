import React, { useState, useEffect } from 'react';
import {
  Bluetooth,
  EyeOff,
  Bell,
  MapPin,
  Shield,
  PhoneCall,
  Wifi,
  Moon,
} from 'lucide-react';
import { VehicleTelemetry } from '../../types/vehicle';

interface TopStatusBarProps {
  telemetry: VehicleTelemetry;
  isStale: boolean;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({ telemetry, isStale }) => {
  const [timeString, setTimeString] = useState('Fri 24 Oct  10:22 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const day = days[now.getDay()];
      const date = now.getDate();
      const month = months[now.getMonth()];
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      setTimeString(`${day} ${date} ${month}  ${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex items-center justify-between text-xs px-2 pt-1 pb-1 select-none z-20">
      {/* Left zone: Items 2, 3, 4 (Bluetooth paired device, Incognito, DND) */}
      <div className="flex items-center gap-3 text-slate-300">
        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
          <Bluetooth className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-medium text-[11px] text-slate-200">
            iPhone 17 Pro... <span className="text-slate-400 font-mono">(18%)</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-slate-400">
          <span title="Incognito Mode" className="cursor-pointer">
            <EyeOff className="w-3.5 h-3.5 hover:text-slate-200 transition-colors" />
          </span>
          <span title="Do Not Disturb Active">
            <Moon className="w-3.5 h-3.5 text-slate-400" />
          </span>
        </div>

        {/* Item 6 & 7: Notification counts */}
        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
          <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1">
            <Bell className="w-2.5 h-2.5 text-slate-400" /> 4
          </span>
          <span className="bg-slate-800/80 px-1.5 py-0.5 rounded border border-white/5">
            2
          </span>
        </div>
      </div>

      {/* Center zone: Simple Energy Hexagon Emblem (Item 5) & Connected icons */}
      <div className="flex items-center gap-2">
        {/* Item 8, 9, 10: Call pill, Live location, Geofence */}
        <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-400">
            <PhoneCall className="w-2.5 h-2.5 animate-pulse" />
            <span className="font-mono">01:48</span>
          </div>
          <span title="Live Location Sharing">
            <MapPin className="w-3 h-3 text-blue-400" />
          </span>
          <span title="Active Geofence">
            <Shield className="w-3 h-3 text-amber-400" />
          </span>
        </div>

        {/* Hexagon Simple Energy Logo */}
        <div className="relative group cursor-pointer" title="Simple Energy OS">
          <div className="w-7 h-7 flex items-center justify-center bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-lg transform rotate-45 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
            <div className="transform -rotate-45 font-black text-black text-[13px] tracking-tighter">
              ❖
            </div>
          </div>
        </div>
      </div>

      {/* Right zone: Items 12 & 13 (Date, Time, LTE signal strength, battery status) */}
      <div className="flex items-center gap-3 text-slate-300">
        <span className="font-semibold text-[11px] text-slate-200 tracking-wide font-mono">
          {timeString}
        </span>

        <div className="flex items-center gap-1.5 bg-black/40 px-2 py-0.5 rounded-full border border-white/5">
          <span className="text-[10px] font-black text-slate-300 tracking-wider">LTE</span>
          <div className="flex items-end gap-0.5 h-3">
            <span className="w-0.5 h-1.5 bg-slate-300 rounded-xs"></span>
            <span className="w-0.5 h-2 bg-slate-300 rounded-xs"></span>
            <span className="w-0.5 h-2.5 bg-slate-300 rounded-xs"></span>
            <span className="w-0.5 h-3 bg-slate-300 rounded-xs"></span>
          </div>
        </div>

        {isStale && (
          <span className="text-[10px] font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300 px-1.5 py-0.5 rounded animate-pulse">
            STALE
          </span>
        )}
      </div>
    </div>
  );
};
