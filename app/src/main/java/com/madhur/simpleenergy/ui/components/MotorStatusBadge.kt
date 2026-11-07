package com.madhur.simpleenergy.ui.components

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
import com.madhur.simpleenergy.model.MotorStatus

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
}
