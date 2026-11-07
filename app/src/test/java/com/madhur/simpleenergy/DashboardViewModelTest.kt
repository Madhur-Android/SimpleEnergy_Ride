package com.madhur.simpleenergy

import app.cash.turbine.test
import com.madhur.simpleenergy.data.VehicleDataSource
import com.madhur.simpleenergy.model.KillSwitchStatus
import com.madhur.simpleenergy.model.MotorStatus
import com.madhur.simpleenergy.model.RideMode
import com.madhur.simpleenergy.model.VehicleScenario
import com.madhur.simpleenergy.model.VehicleTelemetry
import com.madhur.simpleenergy.ui.viewmodel.DashboardViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class DashboardViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private val fakeTelemetryFlow = MutableSharedFlow<VehicleTelemetry>()

    private val fakeDataSource = object : VehicleDataSource {
        override val telemetryFlow = fakeTelemetryFlow
        var lastScenarioSet: VehicleScenario? = null

        override fun setScenario(scenario: VehicleScenario) {
            lastScenarioSet = scenario
        }

        override fun setManualTelemetry(telemetry: VehicleTelemetry) {
            // No-op for mock
        }

        override fun triggerHeartbeatLoss(simulateStale: Boolean) {
            // No-op for mock
        }
    }

    private lateinit var viewModel: DashboardViewModel

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)
        viewModel = DashboardViewModel(fakeDataSource)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testInitialState_matchesPicture1Design() = runTest {
        viewModel.uiState.test {
            val state = awaitItem()
            assertEquals("74", state.displaySpeed)
            assertEquals(MotorStatus.ON, state.motorStatus)
            assertEquals(KillSwitchStatus.INACTIVE, state.killSwitchStatus)
            assertTrue(state.isSpeedValid)
            assertFalse(state.isDataStale)
        }
    }

    @Test
    fun testScenarioReady_updatesMotorOnAndZeroSpeed() = runTest {
        viewModel.uiState.test {
            skipItems(1) // Initial state

            val readyTelemetry = VehicleTelemetry(
                rawSpeedKmh = 0f,
                motorStatus = MotorStatus.ON,
                killSwitchStatus = KillSwitchStatus.INACTIVE,
                rideMode = RideMode.ECO
            )
            fakeTelemetryFlow.emit(readyTelemetry)
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals("0", state.displaySpeed)
            assertEquals(MotorStatus.ON, state.motorStatus)
            assertEquals(KillSwitchStatus.INACTIVE, state.killSwitchStatus)
            assertTrue(state.isMotorEnabled)
        }
    }

    @Test
    fun testScenarioRidingAndAccelerating_updatesSpeedReactively() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            val ridingTelemetry = VehicleTelemetry(
                rawSpeedKmh = 25f,
                motorStatus = MotorStatus.ON,
                killSwitchStatus = KillSwitchStatus.INACTIVE,
                rideMode = RideMode.RIDE
            )
            fakeTelemetryFlow.emit(ridingTelemetry)
            testDispatcher.scheduler.advanceUntilIdle()

            var state = awaitItem()
            assertEquals("25", state.displaySpeed)
            assertEquals(25f, state.speedKmh)
            assertEquals(MotorStatus.ON, state.motorStatus)
            assertEquals(RideMode.RIDE, state.rideMode)

            val accelTelemetry = VehicleTelemetry(
                rawSpeedKmh = 74f,
                motorStatus = MotorStatus.ON,
                killSwitchStatus = KillSwitchStatus.INACTIVE,
                rideMode = RideMode.SONIC
            )
            fakeTelemetryFlow.emit(accelTelemetry)
            testDispatcher.scheduler.advanceUntilIdle()

            state = awaitItem()
            assertEquals("74", state.displaySpeed)
            assertEquals(74f, state.speedKmh)
            assertEquals(RideMode.SONIC, state.rideMode)
        }
    }

    @Test
    fun testScenarioMotorDisabled_activatesKillSwitchAndCutsMotor() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            val disabledTelemetry = VehicleTelemetry(
                rawSpeedKmh = 0f,
                motorStatus = MotorStatus.OFF,
                killSwitchStatus = KillSwitchStatus.ACTIVE
            )
            fakeTelemetryFlow.emit(disabledTelemetry)
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals(KillSwitchStatus.ACTIVE, state.killSwitchStatus)
            assertEquals(MotorStatus.OFF, state.motorStatus)
            assertTrue(state.isKillSwitchTriggered)
            assertFalse(state.isMotorEnabled)
            assertNotNull(state.activeFaultMessage)
        }
    }

    @Test
    fun testEdgeCase1_negativeOrInvalidSpeed_displaysGracefulFallbackWithoutCrash() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            val corruptedTelemetry = VehicleTelemetry(
                rawSpeedKmh = -15f,
                motorStatus = MotorStatus.ON,
                killSwitchStatus = KillSwitchStatus.INACTIVE
            )
            fakeTelemetryFlow.emit(corruptedTelemetry)
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals("---", state.displaySpeed)
            assertNull(state.speedKmh)
            assertFalse(state.isSpeedValid)
            assertNotNull(state.activeFaultMessage)
            assertTrue(state.activeFaultMessage!!.contains("Invalid Speed"))
        }
    }

    @Test
    fun testEdgeCase2_staleData_triggersWatchdogWarning() = runTest {
        viewModel.triggerStaleDataFault()

        val state = viewModel.uiState.value
        assertTrue(state.isDataStale)
        assertNotNull(state.activeFaultMessage)
        assertTrue(state.activeFaultMessage!!.contains("Stale Telemetry"))
    }

    @Test
    fun testKillSwitchOverride_doesNotRequireInstantZeroSpeedPhysics() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            val coastingWithKillSwitch = VehicleTelemetry(
                rawSpeedKmh = 30f,
                motorStatus = MotorStatus.ON,
                killSwitchStatus = KillSwitchStatus.ACTIVE
            )
            fakeTelemetryFlow.emit(coastingWithKillSwitch)
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals(MotorStatus.OFF, state.motorStatus)
            assertEquals(KillSwitchStatus.ACTIVE, state.killSwitchStatus)
            assertEquals("30", state.displaySpeed)
            assertEquals(30f, state.speedKmh)
        }
    }
}
