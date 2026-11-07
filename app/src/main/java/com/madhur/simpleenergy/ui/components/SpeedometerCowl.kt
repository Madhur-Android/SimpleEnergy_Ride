package com.madhur.simpleenergy.ui.components

import android.R.attr.width
import androidx.compose.ui.tooling.preview.Preview
import androidx.lifecycle.viewmodel.compose.viewModel
import com.madhur.simpleenergy.ui.screens.DashboardScreen
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.ui.graphics.drawscope.Stroke
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

                    // Draw vertical fin
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