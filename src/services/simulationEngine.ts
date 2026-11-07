import {
  MotorStatus,
  KillSwitchStatus,
  RideMode,
  ScenarioType,
  VehicleTelemetry,
  VehicleUiState,
  SCENARIO_PRESETS,
} from '../types/vehicle';

export type StateListener = (state: VehicleUiState) => void;

class SimulationEngine {
  private listeners: Set<StateListener> = new Set();
  private timerId: number | null = null;
  private scenarioIndex = 0;
  private lastTelemetryTime = Date.now();
  private staleWatchdogTimerId: number | null = null;

  private state: VehicleUiState = {
    telemetry: {
      speedKmh: 0,
      motorStatus: 'OFF',
      killSwitchStatus: 'INACTIVE',
      rideMode: 'ECO',
      socPercent: 100,
      rangeKm: 62,
      odometerKm: 1324,
      tripAKm: 38.4,
      tripAvgSpeedKmh: 42,
      highBeam: false,
      sideStand: true,
      leftIndicator: false,
      rightIndicator: false,
      serviceDue: false,
      tractionControl: true,
      tpmsOk: true,
      rapidBrake: false,
      superHold: true,
      cruiseControlActive: false,
      cruiseSpeedKmh: 72,
      timestamp: Date.now(),
    },
    currentScenario: 'PARKED',
    isAutoPlaying: true,
    simulationTickMs: 1000,
    isSpeedValid: true,
    isDataStale: false,
    lastHeartbeatAgeMs: 0,
    activeFaultMessage: null,
    showBezel: true,
    activeTripMode: 'ODO',
  };

  private scenarioLoop: ScenarioType[] = [
    'PARKED',
    'READY',
    'RIDING',
    'ACCELERATING',
    'MOTOR_DISABLED',
  ];

  constructor() {
    this.startSimulationLoop();
    this.startStaleWatchdog();
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  public getState(): VehicleUiState {
    return this.state;
  }

  public startSimulationLoop() {
    if (this.timerId) clearInterval(this.timerId);
    this.timerId = window.setInterval(() => {
      if (this.state.isAutoPlaying && !this.state.isDataStale) {
        this.nextScenarioInLoop();
      }
    }, this.state.simulationTickMs);
  }

  public setAutoPlay(enabled: boolean) {
    this.state.isAutoPlaying = enabled;
    this.notify();
  }

  public setTickInterval(intervalMs: number) {
    this.state.simulationTickMs = intervalMs;
    this.startSimulationLoop();
    this.notify();
  }

  public setTripMode(mode: 'ODO' | 'TRIP_A' | 'AVG_SPEED') {
    this.state.activeTripMode = mode;
    this.notify();
  }

  public toggleBezel() {
    this.state.showBezel = !this.state.showBezel;
    this.notify();
  }

  private nextScenarioInLoop() {
    this.scenarioIndex = (this.scenarioIndex + 1) % this.scenarioLoop.length;
    const nextScenario = this.scenarioLoop[this.scenarioIndex];
    this.applyScenario(nextScenario);
  }

  public applyScenario(scenario: ScenarioType) {
    this.state.currentScenario = scenario;
    const preset = SCENARIO_PRESETS[scenario];
    this.lastTelemetryTime = Date.now();
    this.state.lastHeartbeatAgeMs = 0;
    this.state.isDataStale = false;

    if (scenario === 'FAULT_NEGATIVE_SPEED') {
      this.state.isSpeedValid = false;
      this.state.activeFaultMessage = 'CAN Signal Anomaly: Sensor Speed is Negative (-15 km/h)';
      this.state.telemetry = {
        ...this.state.telemetry,
        speedKmh: -15,
        motorStatus: 'ON',
        killSwitchStatus: 'INACTIVE',
        rideMode: 'RIDE',
        timestamp: Date.now(),
      };
      this.notify();
      return;
    }

    if (scenario === 'FAULT_STALE_DATA') {
      this.state.isDataStale = true;
      this.state.activeFaultMessage = 'CAN Heartbeat Timeout: Missing Telemetry Stream (> 2.5s)';
      this.state.lastHeartbeatAgeMs = 3200;
      this.notify();
      return;
    }

    // Normal scenarios
    this.state.isSpeedValid = true;
    this.state.activeFaultMessage = scenario === 'MOTOR_DISABLED' ? 'Kill Switch Active - Motor Inhibited' : null;

    let targetSpeed = preset.speedKmh;
    let rapidBrake = false;
    let cruise = false;

    if (scenario === 'RIDING') {
      cruise = true;
    } else if (scenario === 'ACCELERATING') {
      targetSpeed = 74; // Matches Simple Energy Picture 1
    }

    this.state.telemetry = {
      ...this.state.telemetry,
      speedKmh: targetSpeed,
      motorStatus: preset.motorStatus,
      killSwitchStatus: preset.killSwitchStatus,
      rideMode: preset.rideMode,
      sideStand: preset.sideStand ?? false,
      superHold: preset.superHold ?? false,
      rapidBrake: rapidBrake,
      cruiseControlActive: cruise,
      timestamp: Date.now(),
    };

    this.notify();
  }

  public setManualSpeed(speed: number) {
    this.state.isAutoPlaying = false;
    this.lastTelemetryTime = Date.now();
    this.state.isDataStale = false;

    const isValid = speed >= 0 && speed <= 200;
    this.state.isSpeedValid = isValid;
    this.state.activeFaultMessage = isValid ? null : `Sensor Fault: Speed (${speed} km/h) out of bounds`;

    // Dynamic ride mode depending on speed
    let rideMode: RideMode = this.state.telemetry.rideMode;
    if (speed >= 65) rideMode = 'SONIC';
    else if (speed >= 20) rideMode = 'RIDE';
    else if (speed > 0) rideMode = 'ECO';

    this.state.telemetry = {
      ...this.state.telemetry,
      speedKmh: speed,
      rideMode,
      rapidBrake: false,
      cruiseControlActive: speed > 60 && this.state.telemetry.cruiseControlActive,
      timestamp: Date.now(),
    };
    this.notify();
  }

  public toggleMotor() {
    if (this.state.telemetry.killSwitchStatus === 'ACTIVE') {
      // Cannot start motor while kill switch is engaged
      this.state.activeFaultMessage = 'Cannot activate motor: Kill Switch is ACTIVE!';
      this.notify();
      return;
    }

    const nextStatus: MotorStatus = this.state.telemetry.motorStatus === 'ON' ? 'OFF' : 'ON';
    this.state.telemetry = {
      ...this.state.telemetry,
      motorStatus: nextStatus,
      timestamp: Date.now(),
    };
    this.notify();
  }

  public toggleKillSwitch() {
    const nextStatus: KillSwitchStatus =
      this.state.telemetry.killSwitchStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    // Safety rule: when kill switch is engaged, motor must immediately be shut OFF
    const newMotorStatus = nextStatus === 'ACTIVE' ? 'OFF' : this.state.telemetry.motorStatus;

    this.state.telemetry = {
      ...this.state.telemetry,
      killSwitchStatus: nextStatus,
      motorStatus: newMotorStatus,
      timestamp: Date.now(),
    };

    this.state.activeFaultMessage =
      nextStatus === 'ACTIVE' ? 'Kill Switch Active - Motor Inhibited' : null;

    this.notify();
  }

  public triggerRapidBrake() {
    this.state.telemetry = {
      ...this.state.telemetry,
      rapidBrake: true,
      speedKmh: Math.max(0, this.state.telemetry.speedKmh - 30),
      timestamp: Date.now(),
    };
    this.notify();
    setTimeout(() => {
      this.state.telemetry = {
        ...this.state.telemetry,
        rapidBrake: false,
      };
      this.notify();
    }, 2000);
  }

  public toggleIndicator(direction: 'left' | 'right') {
    if (direction === 'left') {
      this.state.telemetry = {
        ...this.state.telemetry,
        leftIndicator: !this.state.telemetry.leftIndicator,
        rightIndicator: false,
      };
    } else {
      this.state.telemetry = {
        ...this.state.telemetry,
        rightIndicator: !this.state.telemetry.rightIndicator,
        leftIndicator: false,
      };
    }
    this.notify();
  }

  public toggleSideStand() {
    const next = !this.state.telemetry.sideStand;
    this.state.telemetry = {
      ...this.state.telemetry,
      sideStand: next,
      // If side stand is down, vehicle shouldn't drive
      speedKmh: next ? 0 : this.state.telemetry.speedKmh,
    };
    this.notify();
  }

  public toggleHighBeam() {
    this.state.telemetry = {
      ...this.state.telemetry,
      highBeam: !this.state.telemetry.highBeam,
    };
    this.notify();
  }

  public setRideMode(mode: RideMode) {
    this.state.telemetry = {
      ...this.state.telemetry,
      rideMode: mode,
    };
    this.notify();
  }

  private startStaleWatchdog() {
    if (this.staleWatchdogTimerId) clearInterval(this.staleWatchdogTimerId);
    this.staleWatchdogTimerId = window.setInterval(() => {
      if (this.state.currentScenario === 'FAULT_STALE_DATA') {
        this.state.lastHeartbeatAgeMs += 1000;
        this.state.isDataStale = true;
        this.notify();
      } else {
        const age = Date.now() - this.lastTelemetryTime;
        this.state.lastHeartbeatAgeMs = age;
        if (age > 2500 && !this.state.isDataStale) {
          this.state.isDataStale = true;
          this.state.activeFaultMessage = 'CAN Bus Stale: Telemetry Heartbeat Lost';
          this.notify();
        }
      }
    }, 1000);
  }
}

export const simulationEngine = new SimulationEngine();
