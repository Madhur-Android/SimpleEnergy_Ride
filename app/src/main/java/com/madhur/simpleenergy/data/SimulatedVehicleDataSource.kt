package com.madhur.simpleenergy.data

import com.madhur.simpleenergy.model.KillSwitchStatus
import com.madhur.simpleenergy.model.MotorStatus
import com.madhur.simpleenergy.model.RideMode
import com.madhur.simpleenergy.model.VehicleScenario
import com.madhur.simpleenergy.model.VehicleTelemetry
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.isActive

class SimulatedVehicleDataSource(
    private val emissionIntervalMs: Long = 1000L,
    private val autoLoop: Boolean = false
) : VehicleDataSource {

    private var currentScenario: VehicleScenario = VehicleScenario.PARKED
    private var isSimulatingStale: Boolean = false
    private var manualTelemetryOverride: VehicleTelemetry? = null

    override val telemetryFlow: Flow<VehicleTelemetry> = flow {
        val scenarioSequence = listOf(
            VehicleScenario.PARKED,
            VehicleScenario.READY,
            VehicleScenario.RIDING,
            VehicleScenario.ACCELERATING,
            VehicleScenario.MOTOR_DISABLED
        )
        var sequenceIndex = 0

        while (currentCoroutineContext().isActive) {
            if (isSimulatingStale) {
                delay(emissionIntervalMs)
                continue
            }

            val telemetryToEmit: VehicleTelemetry = manualTelemetryOverride ?: run {
                val activeScenario = if (autoLoop) {
                    scenarioSequence[sequenceIndex % scenarioSequence.size].also {
                        sequenceIndex++
                    }
                } else {
                    currentScenario
                }
                generateTelemetryForScenario(activeScenario)
            }

            emit(telemetryToEmit)
            delay(emissionIntervalMs)
        }
    }

    override fun setScenario(scenario: VehicleScenario) {
        manualTelemetryOverride = null
        currentScenario = scenario
        isSimulatingStale = (scenario == VehicleScenario.FAULT_STALE_DATA)
    }

    override fun setManualTelemetry(telemetry: VehicleTelemetry) {
        manualTelemetryOverride = telemetry
        isSimulatingStale = false
    }

    override fun triggerHeartbeatLoss(simulateStale: Boolean) {
        isSimulatingStale = simulateStale
    }

    companion object {
        fun generateTelemetryForScenario(scenario: VehicleScenario): VehicleTelemetry {
            return when (scenario) {
                VehicleScenario.PARKED -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.OFF,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 100,
                    rangeKm = 62,
                    superHold = true,
                    sideStand = true
                )
                VehicleScenario.READY -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 99,
                    rangeKm = 62,
                    superHold = false,
                    sideStand = false
                )
                VehicleScenario.RIDING -> VehicleTelemetry(
                    rawSpeedKmh = 25f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE,
                    socPercent = 96,
                    rangeKm = 58,
                    superHold = false,
                    sideStand = false
                )
                VehicleScenario.ACCELERATING -> VehicleTelemetry(
                    rawSpeedKmh = 74f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.SONIC,
                    socPercent = 92,
                    rangeKm = 52,
                    rapidBrake = false,
                    superHold = false,
                    sideStand = false
                )
                VehicleScenario.MOTOR_DISABLED -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.OFF,
                    killSwitchStatus = KillSwitchStatus.ACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 91,
                    rangeKm = 52,
                    sideStand = false
                )
                VehicleScenario.FAULT_NEGATIVE_SPEED -> VehicleTelemetry(
                    rawSpeedKmh = -15f, // Invalid sensor reading
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE,
                    socPercent = 90,
                    rangeKm = 50
                )
                VehicleScenario.FAULT_STALE_DATA -> VehicleTelemetry(
                    rawSpeedKmh = 40f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE,
                    socPercent = 89,
                    rangeKm = 48
                )
            }
        }
    }
}
