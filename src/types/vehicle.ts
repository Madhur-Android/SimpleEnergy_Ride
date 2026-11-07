/**
 * Vehicle and HMI State definitions mirroring Kotlin models
 */

export type MotorStatus = 'ON' | 'OFF';
export type KillSwitchStatus = 'ACTIVE' | 'INACTIVE';
export type RideMode = 'ECO' | 'RIDE' | 'SONIC' | 'DASH';

export type ScenarioType =
  | 'PARKED'
  | 'READY'
  | 'RIDING'
  | 'ACCELERATING'
  | 'MOTOR_DISABLED'
  | 'FAULT_NEGATIVE_SPEED'
  | 'FAULT_STALE_DATA';

export interface VehicleTelemetry {
  speedKmh: number;               // Current speed (or negative if invalid signal)
  motorStatus: MotorStatus;       // ON | OFF
  killSwitchStatus: KillSwitchStatus; // ACTIVE | INACTIVE
  rideMode: RideMode;             // ECO | RIDE | SONIC
  socPercent: number;             // State of Charge 0-100%
  rangeKm: number;                // Projected range in km
  odometerKm: number;             // Total distance
  tripAKm: number;                // Trip distance
  tripAvgSpeedKmh: number;        // Average trip speed
  highBeam: boolean;
  sideStand: boolean;
  leftIndicator: boolean;
  rightIndicator: boolean;
  serviceDue: boolean;
  tractionControl: boolean;
  tpmsOk: boolean;
  rapidBrake: boolean;
  superHold: boolean;
  cruiseControlActive: boolean;
  cruiseSpeedKmh: number;
  timestamp: number;              // Milliseconds epoch
}

export interface VehicleUiState {
  telemetry: VehicleTelemetry;
  currentScenario: ScenarioType;
  isAutoPlaying: boolean;
  simulationTickMs: number;
  // Edge cases & Fault diagnostics
  isSpeedValid: boolean;          // False if speed < 0 or speed > 200 (sensor glitch)
  isDataStale: boolean;           // True if no heartbeat within timeout threshold
  lastHeartbeatAgeMs: number;
  activeFaultMessage: string | null;
  // UI preferences
  showBezel: boolean;
  activeTripMode: 'ODO' | 'TRIP_A' | 'AVG_SPEED';
}

export const SCENARIO_PRESETS: Record<ScenarioType, {
  name: string;
  description: string;
  speedKmh: number;
  motorStatus: MotorStatus;
  killSwitchStatus: KillSwitchStatus;
  rideMode: RideMode;
  rapidBrake?: boolean;
  superHold?: boolean;
  sideStand?: boolean;
}> = {
  PARKED: {
    name: '1. Parked',
    description: '0 km/h | Motor OFF | Kill switch Inactive | Side Stand down',
    speedKmh: 0,
    motorStatus: 'OFF',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'ECO',
    sideStand: true,
    superHold: true,
  },
  READY: {
    name: '2. Ready',
    description: '0 km/h | Motor ON | Kill switch Inactive | Drive ready',
    speedKmh: 0,
    motorStatus: 'ON',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'ECO',
    sideStand: false,
    superHold: false,
  },
  RIDING: {
    name: '3. Riding',
    description: '25 km/h | Motor ON | Kill switch Inactive | Cruising in Ride mode',
    speedKmh: 25,
    motorStatus: 'ON',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'RIDE',
    sideStand: false,
  },
  ACCELERATING: {
    name: '4. Accelerating',
    description: '50 km/h (to 88 km/h) | Motor ON | Kill switch Inactive | Sonic mode thrusters',
    speedKmh: 74,
    motorStatus: 'ON',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'SONIC',
    sideStand: false,
  },
  MOTOR_DISABLED: {
    name: '5. Motor Disabled',
    description: '0 km/h | Motor OFF | Kill switch ACTIVE | Safety cut-off engaged',
    speedKmh: 0,
    motorStatus: 'OFF',
    killSwitchStatus: 'ACTIVE',
    rideMode: 'ECO',
    sideStand: false,
  },
  FAULT_NEGATIVE_SPEED: {
    name: 'Edge Case: Invalid Speed',
    description: 'Negative sensor reading (-15 km/h) | Graceful fallback display without crash',
    speedKmh: -15,
    motorStatus: 'ON',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'RIDE',
  },
  FAULT_STALE_DATA: {
    name: 'Edge Case: Stale Data',
    description: 'Telemetry heartbeat lost (> 2.5s) | Stale UI warning with fail-safe indicator',
    speedKmh: 42,
    motorStatus: 'ON',
    killSwitchStatus: 'INACTIVE',
    rideMode: 'RIDE',
  },
};
