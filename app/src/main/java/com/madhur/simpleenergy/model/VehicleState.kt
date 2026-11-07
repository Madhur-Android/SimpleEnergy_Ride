package com.madhur.simpleenergy.model

enum class MotorStatus {
    ON,
    OFF
}

enum class KillSwitchStatus {
    ACTIVE,
    INACTIVE
}

enum class RideMode {
    ECO,
    RIDE,
    SONIC
}

enum class VehicleScenario {
    ACCELERATING,
    RIDING,
    READY,
    PARKED,
    MOTOR_DISABLED,
    FAULT_NEGATIVE_SPEED,
    FAULT_STALE_DATA
}

data class VehicleTelemetry(
    val rawSpeedKmh: Float = 74f,
    val motorStatus: MotorStatus = MotorStatus.ON,
    val killSwitchStatus: KillSwitchStatus = KillSwitchStatus.INACTIVE,
    val rideMode: RideMode = RideMode.ECO,
    val socPercent: Int = 100,
    val rangeKm: Int = 62,
    val odometerKm: Int = 1324,
    val rapidBrake: Boolean = true,
    val superHold: Boolean = true,
    val isOverSpeed: Boolean = true,
    val cruiseControlActive: Boolean = true,
    val cruiseSpeedKmh: Int = 72,
    val sideStand: Boolean = false,
    val highBeam: Boolean = false,
    val leftIndicator: Boolean = false,
    val rightIndicator: Boolean = false,
    val timestampMs: Long = System.currentTimeMillis()
)

data class DashboardUiState(
    val speedKmh: Float? = 74f,
    val displaySpeed: String = "74",
    val motorStatus: MotorStatus = MotorStatus.ON,
    val killSwitchStatus: KillSwitchStatus = KillSwitchStatus.INACTIVE,
    val rideMode: RideMode = RideMode.ECO,
    val socPercent: Int = 100,
    val rangeKm: Int = 62,
    val odometerKm: Int = 1324,
    val isSpeedValid: Boolean = true,
    val isDataStale: Boolean = false,
    val activeFaultMessage: String? = null,
    val currentScenario: VehicleScenario = VehicleScenario.ACCELERATING,
    val rapidBrake: Boolean = true,
    val superHold: Boolean = true,
    val isOverSpeed: Boolean = true,
    val cruiseControlActive: Boolean = true,
    val cruiseSpeedKmh: Int = 72,
    val sideStand: Boolean = false,
    val highBeam: Boolean = false,
    val leftIndicator: Boolean = false,
    val rightIndicator: Boolean = false
) {
    val isMotorEnabled: Boolean
        get() = motorStatus == MotorStatus.ON && killSwitchStatus == KillSwitchStatus.INACTIVE

    val isKillSwitchTriggered: Boolean
        get() = killSwitchStatus == KillSwitchStatus.ACTIVE
}
