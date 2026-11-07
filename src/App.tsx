import React, { useState, useEffect } from 'react';
import { simulationEngine } from './services/simulationEngine';
import { VehicleUiState } from './types/vehicle';
import { TopStatusBar } from './components/hmi/TopStatusBar';
import { ModeRangePod } from './components/hmi/ModeRangePod';
import { SpeedometerCowl } from './components/hmi/SpeedometerCowl';
import { AlertStack } from './components/hmi/AlertStack';
import { BottomActionBar } from './components/hmi/BottomActionBar';
import { ParkingSlider } from './components/hmi/ParkingSlider';
import { OdometerSlider } from './components/hmi/OdometerSlider';
import { SimulationControlBar } from './components/controls/SimulationControlBar';
import { AndroidProjectExplorer } from './components/code/AndroidProjectExplorer';
import { UnitTestRunner } from './components/testing/UnitTestRunner';
import { AssignmentReadmeView } from './components/docs/AssignmentReadmeView';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function App() {
  const [uiState, setUiState] = useState<VehicleUiState>(simulationEngine.getState());
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = simulationEngine.subscribe((nextState) => {
      setUiState(nextState);
    });
    return () => unsubscribe();
  }, []);

  const { telemetry, isSpeedValid, isDataStale, activeFaultMessage, showBezel } = uiState;
  const isOverSpeed = telemetry.speedKmh >= 80;

  return (
    <div className="min-h-screen bg-[#07080a] text-slate-100 flex flex-col justify-between overflow-x-hidden selection:bg-emerald-500 selection:text-black">
      {/* Top Banner: Scenario Status & Candidate Assignment Header */}
      <header className="w-full bg-[#0d0f14] border-b border-white/10 px-4 py-2 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="tracking-tight text-sm font-display text-slate-200">
              Simple Energy HMI Cluster
            </span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden sm:inline">
            Landscape Android HMI L1 Technical Assignment
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Scenario Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-white/10">
            <span className="text-[10px] text-slate-400 font-mono">SCENARIO:</span>
            <span className="text-[11px] font-black text-emerald-400 uppercase font-mono">
              {uiState.currentScenario}
            </span>
          </div>
        </div>
      </header>

      {/* Main Automotive Instrument Cluster Viewport */}
      <main className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
        {/* Optional 7-inch Automotive Tablet Bezel Frame */}
        <div
          className={`w-full max-w-6xl aspect-[16/9] max-h-[78vh] transition-all duration-300 relative flex flex-col justify-between overflow-hidden ${
            showBezel
              ? 'rounded-3xl border-8 sm:border-[12px] border-[#181a20] shadow-[0_0_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10 bg-[#090a0d]'
              : 'rounded-2xl border border-white/10 shadow-2xl bg-[#090a0d]'
          }`}
        >
          {/* Ambient cluster background glow */}
          <div className="absolute inset-0 bg-radial from-emerald-950/15 via-transparent to-transparent pointer-events-none" />

          {/* Top Status Bar (Paired Phone, Incognito, Time, LTE) */}
          <TopStatusBar telemetry={telemetry} isStale={isDataStale} />

          {/* Center Area: HUD Pod, Speedometer Cowl, Alerts, Odometer */}
          <div className="relative flex-1 flex flex-col items-center justify-between px-4 sm:px-8 py-1 overflow-hidden z-10">
            {/* Top Center: HUD Mode Pod + Fault Alert Bar */}
            <div className="flex flex-col items-center gap-1.5 w-full">
              <ModeRangePod
                rideMode={telemetry.rideMode}
                rangeKm={telemetry.rangeKm}
                socPercent={telemetry.socPercent}
                onCycleMode={() => {
                  const modes: ('ECO' | 'RIDE' | 'SONIC')[] = ['ECO', 'RIDE', 'SONIC'];
                  const currentIdx = modes.indexOf(telemetry.rideMode as 'ECO' | 'RIDE' | 'SONIC');
                  const nextIndex = currentIdx === -1 ? 0 : (currentIdx + 1) % modes.length;
                  simulationEngine.setRideMode(modes[nextIndex]);
                }}
              />

              {/* Graceful Fault & Safety Alerts (Negative speed / Stale Data / Kill Switch) */}
              {activeFaultMessage && (
                <div className="animate-bounce-short flex items-center gap-2 px-3 py-1 rounded-md bg-red-950/90 border border-red-500/60 text-red-300 text-xs font-bold shadow-lg shadow-red-950/50">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{activeFaultMessage}</span>
                </div>
              )}
            </div>

            {/* Middle Center: Left Parking Slider | Cowl & Speedometer | Right Alert Stack */}
            <div className="relative w-full flex items-center justify-between my-auto">
              {/* Item 1: Left Parking Slider */}
              <ParkingSlider
                isParked={uiState.currentScenario === 'PARKED'}
                onTogglePark={() => simulationEngine.applyScenario('PARKED')}
              />

              {/* Center: Aerodynamic Cowl & Speedometer (Items 20, 21, 23, 24, 25) */}
              <div className="w-full flex-1 flex justify-center">
                <SpeedometerCowl
                  speedKmh={telemetry.speedKmh}
                  isSpeedValid={isSpeedValid}
                  rapidBrake={telemetry.rapidBrake}
                  isOverSpeed={isOverSpeed}
                  rideMode={telemetry.rideMode}
                />
              </div>

              {/* Right Stack: Rapid Brake, SuperHold, OverSpeed 80km/h, Cruise (Items 14-17) */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <AlertStack
                  rapidBrake={telemetry.rapidBrake}
                  superHold={telemetry.superHold}
                  speedKmh={telemetry.speedKmh}
                  cruiseControlActive={telemetry.cruiseControlActive}
                  cruiseSpeedKmh={telemetry.cruiseSpeedKmh}
                />
              </div>
            </div>

            {/* Bottom of Center Area: Item 22 Odometer Slider */}
            <div className="mb-1">
              <OdometerSlider
                odometerKm={telemetry.odometerKm}
                tripAKm={telemetry.tripAKm}
                avgSpeedKmh={telemetry.tripAvgSpeedKmh}
                mode={uiState.activeTripMode}
                onChangeMode={(mode) => simulationEngine.setTripMode(mode)}
              />
            </div>
          </div>

          {/* Bottom Action Bar: App Launcher, Navigation, Tell-tales, Battery SOC, MOTOR ON/OFF (Item 36) */}
          <BottomActionBar
            motorStatus={telemetry.motorStatus}
            killSwitchStatus={telemetry.killSwitchStatus}
            socPercent={telemetry.socPercent}
            highBeam={telemetry.highBeam}
            sideStand={telemetry.sideStand}
            leftIndicator={telemetry.leftIndicator}
            rightIndicator={telemetry.rightIndicator}
            serviceDue={telemetry.serviceDue}
            tractionControl={telemetry.tractionControl}
            tpmsOk={telemetry.tpmsOk}
            onToggleMotor={() => simulationEngine.toggleMotor()}
            onToggleKillSwitch={() => simulationEngine.toggleKillSwitch()}
            onToggleHighBeam={() => simulationEngine.toggleHighBeam()}
            onToggleSideStand={() => simulationEngine.toggleSideStand()}
            onToggleLeftIndicator={() => simulationEngine.toggleIndicator('left')}
            onToggleRightIndicator={() => simulationEngine.toggleIndicator('right')}
          />
        </div>
      </main>

      {/* Bottom Floating Control Deck: Flow loop, Scenarios, Edge Cases, Code/Tests Exporter */}
      <SimulationControlBar
        uiState={uiState}
        onOpenCodeModal={() => setIsCodeModalOpen(true)}
        onOpenTestModal={() => setIsTestModalOpen(true)}
        onOpenDocsModal={() => setIsDocsModalOpen(true)}
      />

      {/* Modal 1: Android Studio Project Explorer & One-Click ZIP Downloader */}
      <AndroidProjectExplorer
        isOpen={isCodeModalOpen}
        onClose={() => setIsCodeModalOpen(false)}
      />

      {/* Modal 2: Unit Test Suite Runner */}
      <UnitTestRunner
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />

      {/* Modal 3: Documentation & Architecture README */}
      <AssignmentReadmeView
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />
    </div>
  );
}
