package io.github.oxgi0.stoa.ui

import android.content.res.Configuration
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import java.util.Locale

/**
 * Erzwingt die UI-Sprache aus dem SettingsStore statt der Geräte-Locale
 * (Parität: Default ist immer Deutsch, egal welche Systemsprache).
 * values/ = de, values-en/ = en.
 */
@Composable
fun LocalizedApp(uiLang: String, content: @Composable () -> Unit) {
    val base = LocalContext.current
    val localized = remember(uiLang, base) {
        val locale = if (uiLang == "en") Locale.ENGLISH else Locale.GERMAN
        val config = Configuration(base.resources.configuration).apply { setLocale(locale) }
        base.createConfigurationContext(config)
    }
    CompositionLocalProvider(LocalContext provides localized, content = content)
}
