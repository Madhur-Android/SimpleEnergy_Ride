Simple Energy EV Dashboard (Home / Ride Cluster)

An automotive-grade Android HMI Home/Ride dashboard application built for electric two-wheelers (Simple One EV), engineered with Kotlin, Jetpack Compose, Coroutines, and StateFlow.

1. Project Overview & Mandatory Requirements

Requirements & Implementation Details

Speedometer

Detail: High-contrast automotive typography displaying current speed in km/h, updating reactively via Coroutine StateFlow.

Status: ✅ Fully Met

Motor Status

Detail: Prominent visual badge clearly distinguishing Motor ON and Motor OFF.

Status: ✅ Fully Met

Kill-Switch Status

Detail: High-visibility safety banner (⚠️ KILL SWITCH ACTIVE • MOTOR CUT) with software interlock disengaging motor drive.

Status: ✅ Fully Met

Reactive UI

Detail: Pure Unidirectional Data Flow (UDF) without manual screen refresh or polling hacks.

Status: ✅ Fully Met

Simulated Data Pipeline

Detail: Uses Kotlin Coroutines and Flow<VehicleTelemetry> to emit vehicle states approximately once per second.

Status: ✅ Fully Met

5 Mandatory Scenarios

Detail: Covers Parked, Ready, Riding, Accelerating, and Motor Disabled.

Status: ✅ Fully Met

Edge Cases (Min 2)

Detail: Gracefully handles invalid/negative speed signals, corrupted values (>200 km/h), stale CAN data watchdog (>2.5s), and motor coasting.

Status: ✅ Fully Met

Unit Tests (Min 2)

Detail: 7 comprehensive unit tests verifying scenario state transitions, edge case handling, and watchdog alerts using JUnit 4, Turbine, and Coroutine Test.

Status: ✅ Fully Met

Platform Target

Detail: Runs natively on Android emulators/devices in locked Landscape orientation (sensorLandscape).

Status: ✅ Fully Met

2. Architecture & Design Approach

The application adheres to clean MVVM (Model-View-ViewModel) with strict Unidirectional Data Flow (UDF) and complete separation between UI, state management, and vehicle telemetry providers.