package io.github.oxgi0.aurelius.ui.theme

import androidx.compose.runtime.Immutable
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color

/** Farb-Tokens 1:1 aus der Expo-App (theme/tokens.ts). */
@Immutable
data class AureliusColors(
    val bg: Color,
    val card: Color,
    val text: Color,
    val textSoft: Color,
    val accent: Color,
    val border: Color,
)

val LightColors = AureliusColors(
    bg = Color(0xFFF4EEE1),
    card = Color(0xFFFBF7ED),
    text = Color(0xFF1B2531),
    textSoft = Color(0xFF5A6575),
    accent = Color(0xFFA6763C),
    border = Color(0xFFE2D9C6),
)

val DarkColors = AureliusColors(
    bg = Color(0xFF0F151D),
    card = Color(0xFF161F2A),
    text = Color(0xFFEAE2D2),
    textSoft = Color(0xFF9AA3B0),
    accent = Color(0xFFC9A264),
    border = Color(0xFF26303D),
)

val LocalColors = staticCompositionLocalOf { LightColors }
