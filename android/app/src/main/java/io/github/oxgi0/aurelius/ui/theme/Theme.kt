package io.github.oxgi0.aurelius.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider

enum class ThemePref { Light, Dark, System }

@Composable
fun AureliusTheme(pref: ThemePref, content: @Composable () -> Unit) {
    val dark = when (pref) {
        ThemePref.Light -> false
        ThemePref.Dark -> true
        ThemePref.System -> isSystemInDarkTheme()
    }
    val colors = if (dark) DarkColors else LightColors
    val scheme = if (dark) {
        darkColorScheme(
            primary = colors.accent,
            background = colors.bg,
            surface = colors.card,
            onBackground = colors.text,
            onSurface = colors.text,
            outline = colors.border,
        )
    } else {
        lightColorScheme(
            primary = colors.accent,
            background = colors.bg,
            surface = colors.card,
            onBackground = colors.text,
            onSurface = colors.text,
            outline = colors.border,
        )
    }
    CompositionLocalProvider(LocalColors provides colors) {
        MaterialTheme(colorScheme = scheme, content = content)
    }
}
