package com.madhur.simpleenergy.data

import com.madhur.simpleenergy.model.VehicleScenario
import com.madhur.simpleenergy.model.VehicleTelemetry
import kotlinx.coroutines.flow.Flow

interface VehicleDataSource {
    val telemetryFlow: Flow<VehicleTelemetry>
    fun setScenario(scenario: VehicleScenario)
    fun setManualTelemetry(telemetry: VehicleTelemetry)
    fun triggerHeartbeatLoss(simulateStale: Boolean)
}
