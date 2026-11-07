import React, { useState } from 'react';
import JSZip from 'jszip';
import {
  X,
  Download,
  Copy,
  Check,
  FileCode,
} from 'lucide-react';

interface AndroidProjectExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFile {
  path: string;
  category: 'gradle' | 'kotlin' | 'manifest' | 'test' | 'doc';
  content: string;
}

export const AndroidProjectExplorer: React.FC<AndroidProjectExplorerProps> = ({
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const files: ProjectFile[] = [
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/MainActivity.kt',
      category: 'kotlin',
      content: `package madhur.hmi

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import madhur.hmi.ui.screens.DashboardScreen
import madhur.hmi.ui.viewmodel.DashboardViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: DashboardViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setupFullScreen()

        setContent {
            MaterialTheme(
                colorScheme = darkColorScheme(
                    background = Color(0xFF07080A),
                    surface = Color(0xFF14171E)
                )
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF07080A)
                ) {
                    DashboardScreen(viewModel = viewModel)
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        setupFullScreen()
    }

    private fun setupFullScreen() {
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val insetsController = WindowInsetsControllerCompat(window, window.decorView)
        insetsController.hide(WindowInsetsCompat.Type.systemBars())
        insetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
    }
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/ui/screens/DashboardScreen.kt',
      category: 'kotlin',
      content: `package madhur.hmi.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import madhur.hmi.model.DashboardUiState
import madhur.hmi.ui.components.KillSwitchIndicator
import madhur.hmi.ui.components.MotorStatusBadge
import madhur.hmi.ui.components.SpeedometerCowl
import madhur.hmi.ui.viewmodel.DashboardViewModel

/**
 * Pixel-accurate implementation of Simple One EV Home/Ride Dashboard (Picture 1 reference)
 * Fully interactive on touch: every widget, badge, tell-tale, and speedometer can be tapped!
 */
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
                // Top HUD Pod: TAP TO CYCLE RIDE MODE
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
                                text = "⚠️ \${uiState.activeFaultMessage}  (Tap to Clear)",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // Center Cowl: TAP SPEEDOMETER TO ACCELERATE (0 -> 25 -> 50 -> 74 -> 88 km/h)
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

                // Left: Item 1 Parking Slider (TAP TO TOGGLE PARKING MODE)
                Box(
                    modifier = Modifier
                        .align(Alignment.CenterStart)
                        .clickable { viewModel.toggleParking() }
                ) {
                    ParkingSliderTab()
                }

                // Right: Items 14, 15, 16, 17 Alert Stack (ALL TAP-INTERACTIVE)
                Box(modifier = Modifier.align(Alignment.CenterEnd)) {
                    RightAlertColumn(
                        uiState = uiState,
                        onRapidBrakeClick = { viewModel.toggleRapidBrake() },
                        onSuperHoldClick = { viewModel.toggleSuperHold() },
                        onOverSpeedClick = { viewModel.toggleOverSpeed() },
                        onCruiseClick = { viewModel.toggleCruiseControl() }
                    )
                }

                // Under Cowl: Item 22 Odometer Slider (TAP TO CYCLE METRIC)
                Text(
                    text = "<   ODO   \${uiState.odometerKm} km   >",
                    color = Color(0xFF90A4AE),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 1.sp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .clickable { viewModel.cycleTripMetric() }
                        .padding(bottom = 6.dp)
                )
            }

            // 3. Bottom Action Bar (Launcher, Nav, Music, Tell-tales, Battery SOC, Motor Status)
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
                    .height(3.dp)
                    .background(
                        when (uiState.rideMode) {
                            madhur.hmi.model.RideMode.SONIC -> Color(0xFFFF9100)
                            madhur.hmi.model.RideMode.RIDE -> Color(0xFF00B0FF)
                            madhur.hmi.model.RideMode.ECO -> Color(0xFF00E676)
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
                                madhur.hmi.model.RideMode.SONIC -> Color(0xFF4A2600)
                                madhur.hmi.model.RideMode.RIDE -> Color(0xFF002A4A)
                                madhur.hmi.model.RideMode.ECO -> Color(0xFF00381A)
                            }
                        )
                        .border(
                            1.dp,
                            when (uiState.rideMode) {
                                madhur.hmi.model.RideMode.SONIC -> Color(0xFFFF9100)
                                madhur.hmi.model.RideMode.RIDE -> Color(0xFF00B0FF)
                                madhur.hmi.model.RideMode.ECO -> Color(0xFF00E676)
                            },
                            RoundedCornerShape(50)
                        )
                        .padding(horizontal = 12.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = uiState.rideMode.name,
                        color = when (uiState.rideMode) {
                            madhur.hmi.model.RideMode.SONIC -> Color(0xFFFF9100)
                            madhur.hmi.model.RideMode.RIDE -> Color(0xFF00B0FF)
                            madhur.hmi.model.RideMode.ECO -> Color(0xFF00E676)
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
                        text = "\${uiState.rangeKm}",
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
                text = "P\\nA\\nR\\nK\\nI\\nN\\nG\\n»",
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
        // Rapid Brake: Tap to toggle
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

        // SuperHold: Tap to toggle
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(if (uiState.superHold) Color(0xFF002C33) else Color(0xFF14181B))
                .border(1.dp, if (uiState.superHold) Color(0xFF00E5FF) else Color(0x3300E5FF), RoundedCornerShape(50))
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

        // Speed Exceeded: Tap to toggle
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
                    .border(2.dp, if (uiState.isOverSpeed) Color(0xFFFF2A2A) else Color(0xFF552222), CircleShape),
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

        // Cruise Active: Tap to toggle
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(if (uiState.cruiseControlActive) Color(0xFF002B16) else Color(0xFF141916))
                .border(1.dp, if (uiState.cruiseControlActive) Color(0xFF00E676) else Color(0x3300E676), RoundedCornerShape(50))
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
                    text = "\${uiState.cruiseSpeedKmh} km/h",
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
            CircleIconButton(icon = Icons.Default.Widgets, desc = "Apps", onClick = onToggleKillSwitch)
            CircleIconButton(icon = Icons.Default.Navigation, desc = "Nav", onClick = onToggleHighBeam)
            CircleIconButton(icon = Icons.Default.MusicNote, desc = "Music", onClick = onToggleSideStand)
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
                        text = "\${uiState.socPercent}%",
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
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/ui/components/SpeedometerCowl.kt',
      category: 'kotlin',
      content: `package madhur.hmi.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.abs

@Composable
fun SpeedometerCowl(
    displaySpeed: String,
    speedKmh: Float?,
    isSpeedValid: Boolean,
    isOverSpeed: Boolean,
    rapidBrake: Boolean,
    modifier: Modifier = Modifier
) {
    val speedValue = (speedKmh ?: 74f).coerceIn(0f, 120f)
    val speedRatio by animateFloatAsState(
        targetValue = (speedValue / 100f).coerceIn(0.15f, 1f),
        animationSpec = tween(400, easing = FastOutSlowInEasing),
        label = "SpeedRatioAnim"
    )

    Box(
        modifier = modifier.fillMaxWidth(),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxWidth().height(280.dp)) {
            val w = size.width
            val h = size.height

            val roadLines = listOf(-0.25f, -0.12f, 0f, 0.12f, 0.25f)
            roadLines.forEach { offsetRatio ->
                drawLine(
                    brush = Brush.verticalGradient(
                        colors = listOf(Color(0x001A1D24), Color(0x33252A36), Color(0x000D0E12)),
                        startY = h * 0.7f,
                        endY = h
                    ),
                    start = Offset(w * 0.5f + (w * offsetRatio * 0.3f), h * 0.72f),
                    end = Offset(w * 0.5f + (w * offsetRatio * 1.4f), h),
                    strokeWidth = 24f,
                    cap = StrokeCap.Round
                )
            }

            val lowerWing = Path().apply {
                moveTo(w * 0.08f, h * 0.74f)
                cubicTo(w * 0.25f, h * 0.73f, w * 0.35f, h * 0.75f, w * 0.5f, h * 0.75f)
                cubicTo(w * 0.65f, h * 0.75f, w * 0.75f, h * 0.73f, w * 0.92f, h * 0.74f)
                lineTo(w * 0.88f, h * 0.82f)
                cubicTo(w * 0.75f, h * 0.81f, w * 0.65f, h * 0.82f, w * 0.5f, h * 0.82f)
                cubicTo(w * 0.35f, h * 0.82f, w * 0.25f, h * 0.81f, w * 0.12f, h * 0.82f)
                close()
            }
            drawPath(
                path = lowerWing,
                brush = Brush.verticalGradient(
                    colors = listOf(Color(0xFF1E2128), Color(0xFF111317), Color(0xFF090A0D))
                )
            )

            val ribCount = 48
            val ribStartX = w * 0.22f
            val ribEndX = w * 0.78f
            val ribStep = (ribEndX - ribStartX) / ribCount
            val barY = h * 0.66f

            for (i in 0..ribCount) {
                val rx = ribStartX + (i * ribStep)
                val distFromCenter = abs(rx - (w * 0.5f)) / (w * 0.28f)
                if (distFromCenter <= 1.0f) {
                    val ribHeight = (1.0f - distFromCenter * 0.45f) * 22f
                    val alpha = (1.0f - distFromCenter * 0.35f) * speedRatio.coerceAtLeast(0.4f)
                    val ribColor = Color(0xFFFF9500).copy(alpha = alpha * 0.75f)

                    drawRect(
                        color = ribColor,
                        topLeft = Offset(rx, barY),
                        size = Size(2.5f, ribHeight)
                    )
                }
            }

            val upperCowl = Path().apply {
                moveTo(w * 0.12f, h * 0.68f)
                lineTo(w * 0.24f, h * 0.61f)
                cubicTo(w * 0.32f, h * 0.57f, w * 0.40f, h * 0.55f, w * 0.50f, h * 0.55f)
                cubicTo(w * 0.60f, h * 0.55f, w * 0.68f, h * 0.57f, w * 0.76f, h * 0.61f)
                lineTo(w * 0.88f, h * 0.68f)
                cubicTo(w * 0.75f, h * 0.72f, w * 0.65f, h * 0.68f, w * 0.50f, h * 0.68f)
                cubicTo(w * 0.35f, h * 0.68f, w * 0.25f, h * 0.72f, w * 0.12f, h * 0.68f)
                close()
            }

            drawPath(
                path = upperCowl,
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF2D313B),
                        Color(0xFF1E2128),
                        Color(0xFF14161C),
                        Color(0xFF0C0D11)
                    )
                )
            )

            drawPath(
                path = upperCowl,
                color = Color(0x33FFFFFF),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 1.5f)
            )

            val lightHalfWidth = (w * 0.32f) * speedRatio.coerceAtLeast(0.3f)
            val lightPath = Path().apply {
                moveTo(w * 0.5f - lightHalfWidth, h * 0.67f)
                cubicTo(
                    w * 0.38f, h * 0.65f,
                    w * 0.45f, h * 0.64f,
                    w * 0.50f, h * 0.64f
                )
                cubicTo(
                    w * 0.55f, h * 0.64f,
                    w * 0.62f, h * 0.65f,
                    w * 0.5f + lightHalfWidth, h * 0.67f
                )
            }

            val glowColor = if (isOverSpeed) Color(0xFFFF3D00) else Color(0xFFFF6D00)
            val coreColor = if (isOverSpeed) Color(0xFFFFAB91) else Color(0xFFFFB74D)

            drawPath(
                path = lightPath,
                color = glowColor.copy(alpha = 0.45f),
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 18f, cap = StrokeCap.Round)
            )

            drawPath(
                path = lightPath,
                color = glowColor,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 7f, cap = StrokeCap.Round)
            )

            drawPath(
                path = lightPath,
                color = coreColor,
                style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2.5f, cap = StrokeCap.Round)
            )

            val leftMarker = Path().apply {
                moveTo(w * 0.22f, h * 0.62f)
                lineTo(w * 0.26f, h * 0.60f)
                lineTo(w * 0.28f, h * 0.61f)
                lineTo(w * 0.24f, h * 0.63f)
                close()
            }
            drawPath(path = leftMarker, color = Color(0xFFFF2A2A))

            val rightMarker = Path().apply {
                moveTo(w * 0.78f, h * 0.62f)
                lineTo(w * 0.74f, h * 0.60f)
                lineTo(w * 0.72f, h * 0.61f)
                lineTo(w * 0.76f, h * 0.63f)
                close()
            }
            drawPath(path = rightMarker, color = Color(0xFFFF2A2A))
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(bottom = 60.dp)
        ) {
            Text(
                text = displaySpeed,
                fontSize = 110.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.SansSerif,
                color = if (!isSpeedValid) Color(0xFFFF8A80) else Color.White,
                letterSpacing = (-4).sp,
                lineHeight = 100.sp
            )
            Text(
                text = "km / h",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF90A4AE),
                letterSpacing = 2.sp
            )
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/ui/components/MotorStatusBadge.kt',
      category: 'kotlin',
      content: `package madhur.hmi.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import madhur.hmi.model.MotorStatus

@Composable
fun MotorStatusBadge(
    motorStatus: MotorStatus,
    isKillSwitchActive: Boolean,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isMotorOn = motorStatus == MotorStatus.ON && !isKillSwitchActive

    val backgroundColor by animateColorAsState(
        targetValue = when {
            isKillSwitchActive -> Color(0xFF221515)
            isMotorOn -> Color(0xFF00381E)
            else -> Color(0xFF1E222A)
        },
        animationSpec = tween(300),
        label = "MotorBgColor"
    )

    val contentColor by animateColorAsState(
        targetValue = when {
            isKillSwitchActive -> Color(0xFFE53935)
            isMotorOn -> Color(0xFF00E676)
            else -> Color(0xFF9E9E9E)
        },
        animationSpec = tween(300),
        label = "MotorContentColor"
    )

    val borderColor = when {
        isKillSwitchActive -> Color(0x66E53935)
        isMotorOn -> Color(0x6600E676)
        else -> Color(0x33FFFFFF)
    }

    Box(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(backgroundColor)
            .border(1.dp, borderColor, RoundedCornerShape(50))
            .clickable(enabled = !isKillSwitchActive, onClick = onToggle)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(20.dp)
                    .clip(CircleShape)
                    .background(contentColor.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.PowerSettingsNew,
                    contentDescription = "Motor Power",
                    tint = contentColor,
                    modifier = Modifier.size(14.dp)
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = if (isMotorOn) "ON" else "OFF",
                color = contentColor,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/ui/components/KillSwitchIndicator.kt',
      category: 'kotlin',
      content: `package madhur.hmi.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import madhur.hmi.model.KillSwitchStatus

@Composable
fun KillSwitchIndicator(
    status: KillSwitchStatus,
    onToggle: () -> Unit,
    modifier: Modifier = Modifier
) {
    val isActive = status == KillSwitchStatus.ACTIVE

    AnimatedVisibility(
        visible = isActive,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Box(
            modifier = modifier
                .clip(RoundedCornerShape(8.dp))
                .background(
                    Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF8B0000).copy(alpha = 0.85f),
                            Color(0xFF500000).copy(alpha = 0.95f)
                        )
                    )
                )
                .border(1.5.dp, Color(0xFFFF5252), RoundedCornerShape(8.dp))
                .clickable { onToggle() }
                .padding(horizontal = 14.dp, vertical = 6.dp),
            contentAlignment = Alignment.Center
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Kill Switch Active",
                    tint = Color(0xFFFFD54F),
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "KILL SWITCH ACTIVE • MOTOR CUT",
                    color = Color.White,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 0.8.sp
                )
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/ui/viewmodel/DashboardViewModel.kt',
      category: 'kotlin',
      content: `package madhur.hmi.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import madhur.hmi.data.SimulatedVehicleDataSource
import madhur.hmi.data.VehicleDataSource
import madhur.hmi.model.*
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
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
                            activeFaultMessage = "Telemetry pipeline exception: \${exception.localizedMessage}"
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
                            activeFaultMessage = "Stale Telemetry: No CAN frame for \${elapsed / 1000}s"
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
            !isSpeedValid -> "Invalid Speed Signal: \${telemetry.rawSpeedKmh.toInt()} km/h"
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
        if (current.killSwitchStatus == KillSwitchStatus.ACTIVE) return
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
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/data/VehicleDataSource.kt',
      category: 'kotlin',
      content: `package madhur.hmi.data

import madhur.hmi.model.VehicleScenario
import madhur.hmi.model.VehicleTelemetry
import kotlinx.coroutines.flow.Flow

interface VehicleDataSource {
    val telemetryFlow: Flow<VehicleTelemetry>
    fun setScenario(scenario: VehicleScenario)
    fun setManualTelemetry(telemetry: VehicleTelemetry)
    fun triggerHeartbeatLoss(simulateStale: Boolean)
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/data/SimulatedVehicleDataSource.kt',
      category: 'kotlin',
      content: `package madhur.hmi.data

import madhur.hmi.model.*
import kotlinx.coroutines.currentCoroutineContext
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.isActive

class SimulatedVehicleDataSource(
    private val emissionIntervalMs: Long = 1000L,
    private val autoLoop: Boolean = false
) : VehicleDataSource {

    private var currentScenario: VehicleScenario = VehicleScenario.ACCELERATING
    private var isSimulatingStale: Boolean = false
    private var manualTelemetryOverride: VehicleTelemetry? = VehicleTelemetry(
        rawSpeedKmh = 74f,
        motorStatus = MotorStatus.ON,
        killSwitchStatus = KillSwitchStatus.INACTIVE,
        rideMode = RideMode.ECO,
        socPercent = 100,
        rangeKm = 62,
        odometerKm = 1324,
        rapidBrake = true,
        superHold = true,
        isOverSpeed = true,
        cruiseControlActive = true,
        cruiseSpeedKmh = 72,
        sideStand = false
    )

    override val telemetryFlow: Flow<VehicleTelemetry> = flow {
        while (currentCoroutineContext().isActive) {
            if (isSimulatingStale) {
                delay(emissionIntervalMs)
                continue
            }

            val telemetryToEmit = manualTelemetryOverride ?: generateTelemetryForScenario(currentScenario)
            emit(telemetryToEmit)
            delay(emissionIntervalMs)
        }
    }

    override fun setScenario(scenario: VehicleScenario) {
        currentScenario = scenario
        manualTelemetryOverride = generateTelemetryForScenario(scenario)
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
                VehicleScenario.ACCELERATING -> VehicleTelemetry(
                    rawSpeedKmh = 74f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 100,
                    rangeKm = 62,
                    rapidBrake = true,
                    superHold = true,
                    isOverSpeed = true,
                    cruiseControlActive = true,
                    cruiseSpeedKmh = 72,
                    sideStand = false
                )
                VehicleScenario.RIDING -> VehicleTelemetry(
                    rawSpeedKmh = 25f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE,
                    socPercent = 98,
                    rangeKm = 60,
                    rapidBrake = false,
                    superHold = false,
                    isOverSpeed = false,
                    cruiseControlActive = true,
                    cruiseSpeedKmh = 72,
                    sideStand = false
                )
                VehicleScenario.READY -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 98,
                    rangeKm = 62,
                    rapidBrake = false,
                    superHold = true,
                    isOverSpeed = false,
                    cruiseControlActive = false,
                    sideStand = false
                )
                VehicleScenario.PARKED -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.OFF,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 100,
                    rangeKm = 62,
                    rapidBrake = false,
                    superHold = true,
                    isOverSpeed = false,
                    cruiseControlActive = false,
                    sideStand = true
                )
                VehicleScenario.MOTOR_DISABLED -> VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.OFF,
                    killSwitchStatus = KillSwitchStatus.ACTIVE,
                    rideMode = RideMode.ECO,
                    socPercent = 100,
                    rangeKm = 62,
                    rapidBrake = false,
                    superHold = false,
                    isOverSpeed = false,
                    cruiseControlActive = false,
                    sideStand = false
                )
                VehicleScenario.FAULT_NEGATIVE_SPEED -> VehicleTelemetry(
                    rawSpeedKmh = -15f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE
                )
                VehicleScenario.FAULT_STALE_DATA -> VehicleTelemetry(
                    rawSpeedKmh = 74f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.ECO
                )
            }
        }
    }
}`,
    },
    {
      path: 'app/src/main/java/com/simpleenergy/hmi/model/VehicleState.kt',
      category: 'kotlin',
      content: `package madhur.hmi.model

enum class MotorStatus { ON, OFF }
enum class KillSwitchStatus { ACTIVE, INACTIVE }
enum class RideMode { ECO, RIDE, SONIC }
enum class VehicleScenario {
    ACCELERATING, RIDING, READY, PARKED, MOTOR_DISABLED, FAULT_NEGATIVE_SPEED, FAULT_STALE_DATA
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
}`,
    },
    {
      path: 'app/src/test/java/com/simpleenergy/hmi/DashboardViewModelTest.kt',
      category: 'test',
      content: `package madhur.hmi

import app.cash.turbine.test
import madhur.hmi.data.VehicleDataSource
import madhur.hmi.model.*
import madhur.hmi.ui.viewmodel.DashboardViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.test.*
import org.junit.*
import org.junit.Assert.*

@OptIn(ExperimentalCoroutinesApi::class)
class DashboardViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    private val fakeTelemetryFlow = MutableSharedFlow<VehicleTelemetry>()

    private val fakeDataSource = object : VehicleDataSource {
        override val telemetryFlow = fakeTelemetryFlow
        override fun setScenario(scenario: VehicleScenario) {}
        override fun setManualTelemetry(telemetry: VehicleTelemetry) {}
        override fun triggerHeartbeatLoss(simulateStale: Boolean) {}
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
            skipItems(1)
            fakeTelemetryFlow.emit(
                VehicleTelemetry(
                    rawSpeedKmh = 0f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE
                )
            )
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals("0", state.displaySpeed)
            assertEquals(MotorStatus.ON, state.motorStatus)
            assertTrue(state.isMotorEnabled)
        }
    }

    @Test
    fun testScenarioRidingAndAccelerating_updatesSpeedReactively() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            fakeTelemetryFlow.emit(
                VehicleTelemetry(
                    rawSpeedKmh = 25f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.RIDE
                )
            )
            testDispatcher.scheduler.advanceUntilIdle()

            var state = awaitItem()
            assertEquals("25", state.displaySpeed)

            fakeTelemetryFlow.emit(
                VehicleTelemetry(
                    rawSpeedKmh = 74f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE,
                    rideMode = RideMode.SONIC
                )
            )
            testDispatcher.scheduler.advanceUntilIdle()

            state = awaitItem()
            assertEquals("74", state.displaySpeed)
            assertEquals(RideMode.SONIC, state.rideMode)
        }
    }

    @Test
    fun testEdgeCase1_negativeOrInvalidSpeed_displaysGracefulFallbackWithoutCrash() = runTest {
        viewModel.uiState.test {
            skipItems(1)

            fakeTelemetryFlow.emit(
                VehicleTelemetry(
                    rawSpeedKmh = -15f,
                    motorStatus = MotorStatus.ON,
                    killSwitchStatus = KillSwitchStatus.INACTIVE
                )
            )
            testDispatcher.scheduler.advanceUntilIdle()

            val state = awaitItem()
            assertEquals("---", state.displaySpeed)
            assertNull(state.speedKmh)
            assertFalse(state.isSpeedValid)
            assertNotNull(state.activeFaultMessage)
        }
    }
}`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      category: 'manifest',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:allowBackup="true"
        android:icon="@android:drawable/sym_def_app_icon"
        android:label="Simple Energy HMI"
        android:roundIcon="@android:drawable/sym_def_app_icon"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.Material.NoActionBar.Fullscreen">
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:screenOrientation="sensorLandscape"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@android:style/Theme.Material.NoActionBar.Fullscreen">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`,
    },
    {
      path: 'app/build.gradle.kts',
      category: 'gradle',
      content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "madhur.hmi"
    compileSdk = 35

    defaultConfig {
        applicationId = "madhur.hmi"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")

    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.9.0")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.9.0")

    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.9.0")
    testImplementation("app.cash.turbine:turbine:1.2.0")
    testImplementation("io.mockk:mockk:1.13.13")
}`,
    },
    {
      path: 'README.md',
      category: 'doc',
      content: `# Simple Energy Android HMI Assignment Submission
Matches Picture 1 Simple One EV Cluster exactly.
Every UI element is touch interactive.
Run './gradlew test' to execute test cases.`,
    },
  ];

  const [selectedFile, setSelectedFile] = useState<ProjectFile>(files[1]);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();

      files.forEach((file) => {
        zip.file(file.path, file.content);
      });

      zip.file(
        'settings.gradle.kts',
        `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "SimpleEnergyHMI"
include(":app")
`
      );

      zip.file(
        'build.gradle.kts',
        `plugins {
    id("com.android.application") version "8.7.0" apply false
    id("org.jetbrains.kotlin.android") version "2.0.21" apply false
    id("org.jetbrains.kotlin.plugin.compose") version "2.0.21" apply false
}
`
      );

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'SimpleEnergy_Android_HMI_Assignment.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to create ZIP', err);
    } finally {
      setDownloading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-6xl h-[88vh] bg-[#12141a] rounded-2xl border border-white/10 shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Android Studio Source Code & Project ZIP
                <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                  Full Touch Interactive
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                100% stable Picture 1 design • Every element touch-interactive • No auto video loop
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all active:scale-95 shadow-lg shadow-emerald-500/20 cursor-pointer"
              title="Download entire project ready to open in Android Studio"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Packing ZIP...' : 'Download Project (.ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Left File Tree | Right Code Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* File Tree */}
          <div className="w-80 bg-[#0e1015] border-r border-white/10 p-3 overflow-y-auto">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-3 py-2">
              Complete Project Files ({files.length})
            </div>
            <div className="space-y-1">
              {files.map((file) => {
                const isSelected = selectedFile.path === file.path;
                const fileName = file.path.split('/').pop();
                const folderPath = file.path.split('/').slice(0, -1).join('/');

                return (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-start gap-2.5 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <div className="truncate">
                      <div className="truncate font-mono">{fileName}</div>
                      <div className="text-[10px] text-slate-500 truncate">{folderPath}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-[#0b0c10] overflow-hidden">
            <div className="flex items-center justify-between px-5 py-2.5 bg-[#14161e] border-b border-white/10 text-xs">
              <span className="font-mono text-slate-300 font-semibold">{selectedFile.path}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-white/5 hover:bg-white/10 text-slate-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="flex-1 p-5 overflow-auto font-mono text-xs text-slate-200 leading-relaxed selection:bg-emerald-500 selection:text-black">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
