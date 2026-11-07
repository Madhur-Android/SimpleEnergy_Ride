import React from 'react';
import { X, BookOpen, Layers, ShieldAlert, Cpu, Terminal, CheckCircle2 } from 'lucide-react';

interface AssignmentReadmeViewProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssignmentReadmeView: React.FC<AssignmentReadmeViewProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="w-full max-w-4xl max-h-[88vh] bg-[#12141a] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Technical Assignment Documentation & Architecture
                <span className="text-xs bg-purple-950 text-purple-400 border border-purple-500/30 px-2 py-0.5 rounded-full font-mono">
                  L1 Technical Evaluation
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Simple Energy EV Scooter HMI • Kotlin • Jetpack Compose • StateFlow
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Doc Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
          {/* Section 1: Objective & Mandatory Requirements */}
          <div className="bg-[#161822] rounded-xl p-5 border border-white/5 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              1. Mandatory Functional Requirements Compliance
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">❖ Reactive Speedometer</span>
                Instantaneous speed display in km/h with high-legibility automotive typography. Updates automatically via StateFlow stream without user refresh.
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">❖ Motor Status (Item 36)</span>
                Dual-state pill indicator clearly displaying ON (luminous green #00E676) and OFF (muted charcoal). Interactive and interlocked with safety cutoffs.
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">❖ Kill-Switch Safety</span>
                Prominent warning beacon when active. ViewModel safety rule immediately cut-offs motor when engaged and inhibits restarts.
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                <span className="font-bold text-emerald-400 block mb-1">❖ Landscape Orientation</span>
                Landscape 16:9 cluster built for 7-inch automotive tablets (Simple One instrument cluster).
              </div>
            </div>
          </div>

          {/* Section 2: Architecture Diagram */}
          <div className="bg-[#161822] rounded-xl p-5 border border-white/5 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              2. Architectural Approach & Data Flow
            </h4>
            <p className="text-xs text-slate-400">
              Follows strict Clean Architecture & MVI (Model-View-Intent) pattern with unidirectional data flow:
            </p>
            <div className="p-4 rounded-lg bg-[#0b0c10] border border-white/5 font-mono text-xs text-slate-300 overflow-x-auto">
              {`Data Layer (SimulatedVehicleDataSource)
    │
    │  Flow<VehicleTelemetry> (~1000ms ticks)
    ▼
Domain / ViewModel Layer (DashboardViewModel)
    │  • Sanitizes raw signals (Bounds check 0..200 km/h)
    │  • Watchdog detects stale heartbeats (> 2500ms)
    │  • Safety interlock cuts motor on Kill Switch Active
    │
    │  Immutable StateFlow<DashboardUiState>
    ▼
UI Layer (Jetpack Compose - DashboardScreen)
    ├── TopStatusBar (Bluetooth, LTE, Date, Time, Emblem)
    ├── ModeRangePod (Ride mode badge, SOC bar, Range)
    ├── SpeedometerCowl (Sculpted 3D Cowl, LED Lightbar, Thrusters)
    ├── AlertStack (Rapid Brake, SuperHold, OverSpeed 80km/h)
    └── BottomActionBar (Motor Status ON/OFF, Kill Switch, Indicators)`}
            </div>
          </div>

          {/* Section 3: Edge Cases Handled */}
          <div className="bg-[#161822] rounded-xl p-5 border border-white/5 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              3. Graceful Edge Case & Fault Handling
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">Edge Case 1:</span>
                <div>
                  <span className="text-white font-semibold">Corrupted / Negative Speed Signals:</span> When sensor glitches or reports negative values (e.g. -15 km/h), the ViewModel traps the anomaly, sets <code className="text-emerald-400 font-mono">isSpeedValid = false</code>, and gracefully displays <code className="text-amber-400 font-mono">"---"</code> with a non-blocking diagnostic notification. The application never crashes.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">Edge Case 2:</span>
                <div>
                  <span className="text-white font-semibold">Stale / Disconnected Telemetry:</span> An asynchronous watchdog coroutine tracks elapsed time since the last valid CAN frame. If elapsed time exceeds 2500ms, the cluster triggers a <code className="text-amber-400 font-mono">"Stale Telemetry"</code> banner to prevent the rider from relying on frozen telemetry.
                </div>
              </div>
              <div className="p-3 rounded-lg bg-black/40 border border-white/5 flex items-start gap-2">
                <span className="font-bold text-amber-400 shrink-0">Edge Case 3:</span>
                <div>
                  <span className="text-white font-semibold">Motor Cut While Moving (Kinetic Coasting):</span> Implements the assignment rule: <em>"Motor OFF does not inherently mean speed must instantly become zero."</em> When the kill switch is triggered while riding, the motor cuts immediately while the speedometer tracks vehicle physical deceleration.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Build & Test Instructions */}
          <div className="bg-[#161822] rounded-xl p-5 border border-white/5 space-y-3">
            <h4 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              4. Android Studio Execution Steps
            </h4>
            <div className="p-4 rounded-lg bg-[#0b0c10] border border-white/5 font-mono text-xs space-y-2 text-slate-300">
              <div className="text-slate-500">// Run all 7 unit tests from CLI</div>
              <div className="text-emerald-400 font-bold">./gradlew test</div>
              <div className="text-slate-500 pt-2">// Build debug APK</div>
              <div className="text-emerald-400 font-bold">./gradlew assembleDebug</div>
              <div className="text-slate-500 pt-2">// Or download project ZIP from the top bar and open in Android Studio directly</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
