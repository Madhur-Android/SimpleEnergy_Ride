package com.madhur.simpleenergy.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.madhur.simpleenergy.data.SimulatedVehicleDataSource
import com.madhur.simpleenergy.data.VehicleDataSource
import com.madhur.simpleenergy.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

class DashboardViewModel(
    private val dataSource: VehicleDataSource = SimulatedVehicleDataSource()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DashboardUiState())
    val uiState: StateFlow<DashboardUiState> = _uiState.asStateFlow()

    private var lastTelemetryReceivedTimestamp: Long = System.currentTimeMillis()
    private var telemetryCollectionJob: Job? = null
    private var staleWatchdogJob: Job? = null

    companion object {
        const val STALE_HEARTBEAT_TIMEOUT_MS = 2500L
        const val MAX_REASONABLE_SPEED_KMH = 200f
    }

    init {
        startTelemetryCollection()
        startStaleWatchdog()
    }

    private fun startTelemetryCollection() {
        telemetryCollectionJob?.cancel()
        telemetryCollectionJob = viewModelScope.launch {
            dataSource.telemetryFlow
                .catch { exception ->
                    _uiState.update { current ->
                        current.copy(
                            isSpeedValid = false,
                            displaySpeed = "ERR",
                            activeFaultMessage = "Telemetry pipeline exception: ${exception.localizedMessage}"
                        )
                    }
                }
                .collect { telemetry ->
                    processIncomingTelemetry(telemetry)
                }
        }
    }

    private fun startStaleWatchdog() {
        staleWatchdogJob?.cancel()
        staleWatchdogJob = viewModelScope.launch {
            while (isActive) {
                delay(1000L)
                val elapsed = System.currentTimeMillis() - lastTelemetryReceivedTimestamp
                if (elapsed > STALE_HEARTBEAT_TIMEOUT_MS && !_uiState.value.isDataStale) {
                    _uiState.update { current ->
                        current.copy(
                            isDataStale = true,
                            activeFaultMessage = "Stale Telemetry: No CAN frame for ${elapsed / 1000}s"
                        )
                    }
                }
            }
        }
    }

    fun processIncomingTelemetry(telemetry: VehicleTelemetry) {
        lastTelemetryReceivedTimestamp = System.currentTimeMillis()

        val isSpeedValid = telemetry.rawSpeedKmh in 0f..MAX_REASONABLE_SPEED_KMH
        val displaySpeed = if (isSpeedValid) {
            telemetry.rawSpeedKmh.toInt().toString()
        } else {
            "---"
        }

        val faultMessage = when {
            !isSpeedValid -> "Invalid Speed Signal: ${telemetry.rawSpeedKmh.toInt()} km/h"
            telemetry.killSwitchStatus == KillSwitchStatus.ACTIVE -> "Kill Switch Active - Motor Disabled"
            else -> null
        }

        val safeMotorStatus = if (telemetry.killSwitchStatus == KillSwitchStatus.ACTIVE) {
            MotorStatus.OFF
        } else {
            telemetry.motorStatus
        }

        _uiState.update {
            it.copy(
                speedKmh = if (isSpeedValid) telemetry.rawSpeedKmh else null,
                displaySpeed = displaySpeed,
                motorStatus = safeMotorStatus,
                killSwitchStatus = telemetry.killSwitchStatus,
                rideMode = telemetry.rideMode,
                socPercent = telemetry.socPercent,
                rangeKm = telemetry.rangeKm,
                odometerKm = telemetry.odometerKm,
                isSpeedValid = isSpeedValid,
                isDataStale = false,
                activeFaultMessage = faultMessage,
                rapidBrake = telemetry.rapidBrake,
                superHold = telemetry.superHold,
                isOverSpeed = telemetry.isOverSpeed,
                cruiseControlActive = telemetry.cruiseControlActive,
                cruiseSpeedKmh = telemetry.cruiseSpeedKmh,
                sideStand = telemetry.sideStand,
                highBeam = telemetry.highBeam,
                leftIndicator = telemetry.leftIndicator,
                rightIndicator = telemetry.rightIndicator
            )
        }
    }

    fun toggleMotor() {
        val current = _uiState.value
        if (current.killSwitchStatus == KillSwitchStatus.ACTIVE) {
            return
        }
        val next = if (current.motorStatus == MotorStatus.ON) MotorStatus.OFF else MotorStatus.ON
        _uiState.update { it.copy(motorStatus = next) }
        dataSource.setManualTelemetry(
            VehicleTelemetry(
                rawSpeedKmh = if (next == MotorStatus.OFF) 0f else (current.speedKmh ?: 0f),
                motorStatus = next,
                killSwitchStatus = current.killSwitchStatus,
                rideMode = current.rideMode,
                rangeKm = current.rangeKm
            )
        )
    }

    fun toggleKillSwitch() {
        val current = _uiState.value
        val next = if (current.killSwitchStatus == KillSwitchStatus.ACTIVE) KillSwitchStatus.INACTIVE else KillSwitchStatus.ACTIVE
        _uiState.update {
            it.copy(
                killSwitchStatus = next,
                motorStatus = if (next == KillSwitchStatus.ACTIVE) MotorStatus.OFF else MotorStatus.ON,
                activeFaultMessage = if (next == KillSwitchStatus.ACTIVE) "Kill Switch Active - Motor Disabled" else null
            )
        }
        dataSource.setManualTelemetry(
            VehicleTelemetry(
                rawSpeedKmh = if (next == KillSwitchStatus.ACTIVE) 0f else (current.speedKmh ?: 74f),
                motorStatus = if (next == KillSwitchStatus.ACTIVE) MotorStatus.OFF else MotorStatus.ON,
                killSwitchStatus = next,
                rideMode = current.rideMode
            )
        )
    }

    fun cycleSpeed() {
        val speeds = listOf(0f, 25f, 50f, 74f, 88f)
        val currentSpeed = _uiState.value.speedKmh ?: 74f
        val nextIndex = (speeds.indexOfFirst { it.toInt() == currentSpeed.toInt() } + 1) % speeds.size
        val newSpeed = speeds[nextIndex]

        val newMode = when {
            newSpeed >= 74f -> RideMode.SONIC
            newSpeed >= 25f -> RideMode.RIDE
            else -> RideMode.ECO
        }

        _uiState.update {
            it.copy(
                speedKmh = newSpeed,
                displaySpeed = newSpeed.toInt().toString(),
                motorStatus = if (newSpeed > 0f) MotorStatus.ON else it.motorStatus,
                rideMode = newMode,
                isOverSpeed = newSpeed >= 80f
            )
        }
        dataSource.setManualTelemetry(
            VehicleTelemetry(
                rawSpeedKmh = newSpeed,
                motorStatus = if (newSpeed > 0f) MotorStatus.ON else _uiState.value.motorStatus,
                killSwitchStatus = KillSwitchStatus.INACTIVE,
                rideMode = newMode,
                isOverSpeed = newSpeed >= 80f
            )
        )
    }

    fun cycleRideMode() {
        val currentMode = _uiState.value.rideMode
        val nextMode = when (currentMode) {
            RideMode.ECO -> RideMode.RIDE
            RideMode.RIDE -> RideMode.SONIC
            RideMode.SONIC -> RideMode.ECO
        }
        val nextRange = when (nextMode) {
            RideMode.ECO -> 62
            RideMode.RIDE -> 58
            RideMode.SONIC -> 52
        }
        _uiState.update { it.copy(rideMode = nextMode, rangeKm = nextRange) }
    }

    fun toggleParking() {
        val current = _uiState.value
        val isNowParked = current.currentScenario != VehicleScenario.PARKED
        if (isNowParked) {
            _uiState.update {
                it.copy(
                    speedKmh = 0f,
                    displaySpeed = "0",
                    motorStatus = MotorStatus.OFF,
                    sideStand = true,
                    currentScenario = VehicleScenario.PARKED
                )
            }
        } else {
            _uiState.update {
                it.copy(
                    speedKmh = 74f,
                    displaySpeed = "74",
                    motorStatus = MotorStatus.ON,
                    sideStand = false,
                    currentScenario = VehicleScenario.ACCELERATING
                )
            }
        }
    }

    fun toggleRapidBrake() {
        _uiState.update { it.copy(rapidBrake = !it.rapidBrake) }
    }

    fun toggleSuperHold() {
        _uiState.update { it.copy(superHold = !it.superHold) }
    }

    fun toggleOverSpeed() {
        val next = !_uiState.value.isOverSpeed
        val nextSpeed = if (next) 88f else 74f
        _uiState.update {
            it.copy(
                isOverSpeed = next,
                speedKmh = nextSpeed,
                displaySpeed = nextSpeed.toInt().toString()
            )
        }
    }

    fun toggleCruiseControl() {
        _uiState.update { it.copy(cruiseControlActive = !it.cruiseControlActive) }
    }

    fun toggleHighBeam() {
        _uiState.update { it.copy(highBeam = !it.highBeam) }
    }

    fun toggleSideStand() {
        val next = !_uiState.value.sideStand
        _uiState.update {
            it.copy(
                sideStand = next,
                speedKmh = if (next) 0f else it.speedKmh,
                displaySpeed = if (next) "0" else it.displaySpeed
            )
        }
    }

    fun toggleLeftIndicator() {
        _uiState.update { it.copy(leftIndicator = !it.leftIndicator, rightIndicator = false) }
    }

    fun toggleRightIndicator() {
        _uiState.update { it.copy(rightIndicator = !it.rightIndicator, leftIndicator = false) }
    }

    fun cycleTripMetric() {
        val currentOdo = _uiState.value.odometerKm
        val nextOdo = if (currentOdo == 1324) 1325 else 1324
        _uiState.update { it.copy(odometerKm = nextOdo) }
    }

    override fun onCleared() {
        super.onCleared()
        telemetryCollectionJob?.cancel()
        staleWatchdogJob?.cancel()
    }

    fun triggerStaleDataFault() {
        TODO("Not yet implemented")
    }
}
