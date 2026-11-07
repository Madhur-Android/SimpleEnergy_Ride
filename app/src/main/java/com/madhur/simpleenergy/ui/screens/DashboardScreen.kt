package com.madhur.simpleenergy.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.BatteryFull
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material.icons.filled.Build
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Highlight
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material.icons.filled.Navigation
import androidx.compose.material.icons.filled.Speed
import androidx.compose.material.icons.filled.TwoWheeler
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Widgets
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Devices
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.madhur.simpleenergy.model.DashboardUiState
import com.madhur.simpleenergy.ui.components.MotorStatusBadge
import com.madhur.simpleenergy.ui.components.SpeedometerCowl
import com.madhur.simpleenergy.ui.viewmodel.DashboardViewModel

@Composable
fun DashboardScreen(
    viewModel: DashboardViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF07080A))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 24.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            TopStatusBar(uiState = uiState)

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier.align(Alignment.TopCenter),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    HudModePod(
                        uiState = uiState,
                        onPodClick = { viewModel.cycleRideMode() }
                    )

                    AnimatedVisibility(
                        visible = uiState.activeFaultMessage != null,
                        enter = fadeIn(),
                        exit = fadeOut()
                    ) {
                        Box(
                            modifier = Modifier
                                .padding(top = 8.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(Color(0xDDB71C1C))
                                .border(1.dp, Color(0xFFFF5252), RoundedCornerShape(6.dp))
                                .clickable { viewModel.toggleKillSwitch() }
                                .padding(horizontal = 14.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = "⚠️ ${uiState.activeFaultMessage}  (Tap to Clear)",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Box(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .clickable { viewModel.cycleSpeed() }
                ) {
                    SpeedometerCowl(
                        displaySpeed = uiState.displaySpeed,
                        speedKmh = uiState.speedKmh,
                        isSpeedValid = uiState.isSpeedValid,
                        isOverSpeed = uiState.isOverSpeed,
                        rapidBrake = uiState.rapidBrake
                    )
                }

                Box(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .clickable { viewModel.toggleParking() }
                ) {
                    ParkingSliderTab()
                }

                Box(modifier = Modifier.align(Alignment.CenterEnd)) {
                    RightAlertColumn(
                        uiState = uiState,
                        onRapidBrakeClick = { viewModel.toggleRapidBrake() },
                        onSuperHoldClick = { viewModel.toggleSuperHold() },
                        onOverSpeedClick = { viewModel.toggleOverSpeed() },
                        onCruiseClick = { viewModel.toggleCruiseControl() }
                    )
                }

                Text(
                    text = "<   ODO   ${uiState.odometerKm} km   >",
                    color = Color(0xFF90A4AE),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.sp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .clickable { viewModel.cycleTripMetric() }
                        .padding(bottom = 6.dp, end = 30.dp)
                )
            }

            BottomBar(
                uiState = uiState,
                onToggleMotor = { viewModel.toggleMotor() },
                onToggleHighBeam = { viewModel.toggleHighBeam() },
                onToggleSideStand = { viewModel.toggleSideStand() },
                onToggleLeftIndicator = { viewModel.toggleLeftIndicator() },
                onToggleRightIndicator = { viewModel.toggleRightIndicator() },
                onToggleKillSwitch = { viewModel.toggleKillSwitch() }
            )
        }
    }
}

@Composable
private fun TopStatusBar(uiState: DashboardUiState) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Bluetooth,
                contentDescription = "Bluetooth",
                tint = Color(0xFF448AFF),
                modifier = Modifier.size(15.dp)
            )
            Spacer(modifier = Modifier.width(6.dp))
            Text(
                text = "iPhone 17 P...(18%)",
                color = Color(0xFFCFD8DC),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Spacer(modifier = Modifier.width(10.dp))
            Icon(
                imageVector = Icons.Default.VisibilityOff,
                contentDescription = "Incognito",
                tint = Color(0xFF90A4AE),
                modifier = Modifier.size(14.dp)
            )
        }

        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(RoundedCornerShape(6.dp))
                .background(Color(0xFF00E676)),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.FlashOn,
                contentDescription = "Simple Energy",
                tint = Color.Black,
                modifier = Modifier.size(16.dp)
            )
        }

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                text = "Fri 10 Oct  10:10 AM",
                color = Color(0xFFECEFF1),
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(4.dp))
                    .background(Color(0xFF1E2129))
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(4.dp))
                    .padding(horizontal = 6.dp, vertical = 2.dp)
            ) {
                Text(
                    text = "LTE",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }
}

@Composable
private fun HudModePod(
    uiState: DashboardUiState,
    onPodClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .padding(top = 10.dp)
            .width(260.dp)
            .clip(RoundedCornerShape(14.dp))
            .background(
                Brush.verticalGradient(
                    colors = listOf(Color(0xFF282C35), Color(0xFF1A1C22), Color(0xFF121418))
                )
            )
            .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(14.dp))
            .clickable { onPodClick() }
    ) {
        Column {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(5.dp)
                    .background(
                        when (uiState.rideMode) {
                            com.madhur.simpleenergy.model.RideMode.SONIC -> Color(0xFFFF9100)
                            com.madhur.simpleenergy.model.RideMode.RIDE -> Color(0xFF00B0FF)
                            com.madhur.simpleenergy.model.RideMode.ECO -> Color(0xFF00E676)
                        }
                    )
            )

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 14.dp, vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(50))
                        .background(
                            when (uiState.rideMode) {
                                com.madhur.simpleenergy.model.RideMode.SONIC -> Color(0xFF4A2600)
                                com.madhur.simpleenergy.model.RideMode.RIDE -> Color(0xFF002A4A)
                                com.madhur.simpleenergy.model.RideMode.ECO -> Color(0xFF00381A)
                            }
                        )
                        .border(
                            1.dp,
                            when (uiState.rideMode) {
                                com.madhur.simpleenergy.model.RideMode.SONIC -> Color(0xFFFF9100)
                                com.madhur.simpleenergy.model.RideMode.RIDE -> Color(0xFF00B0FF)
                                com.madhur.simpleenergy.model.RideMode.ECO -> Color(0xFF00E676)
                            },
                            RoundedCornerShape(50)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = uiState.rideMode.name,
                        color = when (uiState.rideMode) {
                            com.madhur.simpleenergy.model.RideMode.SONIC -> Color(0xFFFF9100)
                            com.madhur.simpleenergy.model.RideMode.RIDE -> Color(0xFF00B0FF)
                            com.madhur.simpleenergy.model.RideMode.ECO -> Color(0xFF00E676)
                        },
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                Text(
                    text = "⇄",
                    color = Color(0xFF90A4AE),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )

                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = "${uiState.rangeKm}",
                        color = Color.White,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Column(modifier = Modifier.padding(bottom = 1.dp)) {
                        Text(
                            text = "km",
                            color = Color(0xFFB0BEC5),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            lineHeight = 10.sp
                        )
                        Text(
                            text = "Range",
                            color = Color(0xFF78909C),
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Medium,
                            lineHeight = 9.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ParkingSliderTab() {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(topEnd = 12.dp, bottomEnd = 12.dp))
            .background(Color(0xFF1E2128))
            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(topEnd = 12.dp, bottomEnd = 12.dp))
            .padding(horizontal = 6.dp, vertical = 12.dp)
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "P\nA\nR\nK\nI\nN\nG\n»",
                color = Color(0xFFB0BEC5),
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                lineHeight = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            repeat(4) {
                Box(
                    modifier = Modifier
                        .size(3.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF78909C))
                )
            }
        }
    }
}

@Composable
private fun RightAlertColumn(
    uiState: DashboardUiState,
    onRapidBrakeClick: () -> Unit,
    onSuperHoldClick: () -> Unit,
    onOverSpeedClick: () -> Unit,
    onCruiseClick: () -> Unit
) {
    Column(
        modifier = Modifier.width(150.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
        horizontalAlignment = Alignment.End
    ) {
        Row(
            modifier = Modifier.clickable { onRapidBrakeClick() },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(if (uiState.rapidBrake) Color(0xFF4A0E0E) else Color(0xFF221111)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "⚡",
                    color = if (uiState.rapidBrake) Color(0xFFFF2A2A) else Color(0xFF883333),
                    fontSize = 14.sp
                )
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "Rapid",
                    color = if (uiState.rapidBrake) Color(0xFFFF5252) else Color(0xFF994444),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 12.sp
                )
                Text(
                    text = "Brake",
                    color = if (uiState.rapidBrake) Color.White else Color(0xFF777777),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 12.sp
                )
            }
        }

        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(if (uiState.superHold) Color(0xFF002C33) else Color(0xFF14181B))
                .border(
                    1.dp,
                    if (uiState.superHold) Color(0xFF00E5FF) else Color(0x3300E5FF),
                    RoundedCornerShape(50)
                )
                .clickable { onSuperHoldClick() }
                .padding(horizontal = 14.dp, vertical = 6.dp)
        ) {
            Text(
                text = "(( SUPER HOLD ))",
                color = if (uiState.superHold) Color(0xFF00E5FF) else Color(0xFF558899),
                fontSize = 10.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 0.5.sp
            )
        }

        Row(
            modifier = Modifier.clickable { onOverSpeedClick() },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(Color.Black)
                    .border(
                        2.dp,
                        if (uiState.isOverSpeed) Color(0xFFFF2A2A) else Color(0xFF552222),
                        CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "80",
                        color = if (uiState.isOverSpeed) Color.White else Color(0xFF888888),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        lineHeight = 10.sp
                    )
                    Text(
                        text = "km/h",
                        color = Color(0xFFB0BEC5),
                        fontSize = 6.sp,
                        lineHeight = 6.sp
                    )
                }
            }
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = "Speed",
                    color = if (uiState.isOverSpeed) Color.White else Color(0xFF888888),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 12.sp
                )
                Text(
                    text = "Exceeded",
                    color = if (uiState.isOverSpeed) Color(0xFFFF5252) else Color(0xFF663333),
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 11.sp
                )
            }
        }

        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(if (uiState.cruiseControlActive) Color(0xFF002B16) else Color(0xFF141916))
                .border(
                    1.dp,
                    if (uiState.cruiseControlActive) Color(0xFF00E676) else Color(0x3300E676),
                    RoundedCornerShape(50)
                )
                .clickable { onCruiseClick() }
                .padding(horizontal = 10.dp, vertical = 6.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Speed,
                contentDescription = "Cruise",
                tint = if (uiState.cruiseControlActive) Color(0xFF00E676) else Color(0xFF336644),
                modifier = Modifier.size(16.dp)
            )
            Column(horizontalAlignment = Alignment.End) {
                Text(
                    text = if (uiState.cruiseControlActive) "Active" else "Standby",
                    color = if (uiState.cruiseControlActive) Color(0xFF00E676) else Color(0xFF779988),
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    lineHeight = 10.sp
                )
                Text(
                    text = "${uiState.cruiseSpeedKmh} km/h",
                    color = if (uiState.cruiseControlActive) Color.White else Color(0xFF888888),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    lineHeight = 11.sp
                )
            }
        }
    }
}

@Composable
private fun BottomBar(
    uiState: DashboardUiState,
    onToggleMotor: () -> Unit,
    onToggleHighBeam: () -> Unit,
    onToggleSideStand: () -> Unit,
    onToggleLeftIndicator: () -> Unit,
    onToggleRightIndicator: () -> Unit,
    onToggleKillSwitch: () -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            CircleIconButton(
                icon = Icons.Default.Widgets,
                desc = "Apps",
                onClick = onToggleKillSwitch
            )
            CircleIconButton(
                icon = Icons.Default.Navigation,
                desc = "Nav",
                onClick = onToggleHighBeam
            )
            CircleIconButton(
                icon = Icons.Default.MusicNote,
                desc = "Music",
                onClick = onToggleSideStand
            )
        }

        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(Color(0xFF14171E))
                .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(50))
                .padding(horizontal = 16.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = Icons.Default.Highlight,
                contentDescription = "High Beam",
                tint = if (uiState.highBeam) Color(0xFF448AFF) else Color(0xFF455A64),
                modifier = Modifier
                    .size(16.dp)
                    .clickable { onToggleHighBeam() }
            )

            Icon(
                imageVector = Icons.Default.TwoWheeler,
                contentDescription = "Side Stand",
                tint = if (uiState.sideStand) Color(0xFFFFD600) else Color(0xFF555022),
                modifier = Modifier
                    .size(16.dp)
                    .clickable { onToggleSideStand() }
            )

            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                contentDescription = "Left",
                tint = if (uiState.leftIndicator) Color(0xFF00E676) else Color(0xFF37474F),
                modifier = Modifier
                    .size(14.dp)
                    .clickable { onToggleLeftIndicator() }
            )

            Icon(
                imageVector = Icons.Default.Build,
                contentDescription = "Service",
                tint = Color(0xFFFF9100),
                modifier = Modifier.size(14.dp)
            )

            Icon(
                imageVector = Icons.Default.Speed,
                contentDescription = "TC",
                tint = Color(0xFF00E676),
                modifier = Modifier.size(15.dp)
            )

            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Right",
                tint = if (uiState.rightIndicator) Color(0xFF00E676) else Color(0xFF37474F),
                modifier = Modifier
                    .size(14.dp)
                    .clickable { onToggleRightIndicator() }
            )

            Text(
                text = "(!)",
                color = Color(0xFF90A4AE),
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                modifier = Modifier.clickable { onToggleSideStand() }
            )
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Color(0xFF00381A))
                    .border(1.dp, Color(0xFF00E676), RoundedCornerShape(50))
                    .clickable { onToggleKillSwitch() }
                    .padding(horizontal = 14.dp, vertical = 8.dp)
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.BatteryFull,
                        contentDescription = "Battery",
                        tint = Color(0xFF00E676),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "${uiState.socPercent}%",
                        color = Color(0xFF00E676),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            MotorStatusBadge(
                motorStatus = uiState.motorStatus,
                isKillSwitchActive = uiState.isKillSwitchTriggered,
                onToggle = onToggleMotor
            )
        }
    }
}

@Composable
private fun CircleIconButton(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    desc: String,
    onClick: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .size(38.dp)
            .clip(CircleShape)
            .background(Color(0xFF1E2128))
            .border(1.dp, Color(0x33FFFFFF), CircleShape)
            .clickable { onClick() },
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = desc,
            tint = Color(0xFFECEFF1),
            modifier = Modifier.size(18.dp)
        )
    }
}

@Preview(
    name = "Tablet Preview",
    device = "spec:width=1280dp,height=800dp,dpi=240",
    showBackground = true
)
@Composable
fun DashboardScreenPreview() {
    DashboardScreen(viewModel = viewModel())
}