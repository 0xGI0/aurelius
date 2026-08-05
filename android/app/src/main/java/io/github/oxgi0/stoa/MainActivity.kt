package io.github.oxgi0.stoa

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import io.github.oxgi0.stoa.ui.LocalizedApp
import io.github.oxgi0.stoa.ui.nav.AureliusNav
import io.github.oxgi0.stoa.ui.theme.AureliusTheme
import io.github.oxgi0.stoa.ui.theme.ThemePref

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        val container = (application as AureliusApp).container
        val settings = container.settings
        setContent {
            val uiLang by settings.uiLang.collectAsState(initial = "de")
            val theme by settings.themePref.collectAsState(initial = "system")
            // Offline-Queue beim Start nachholen (Spec §6)
            androidx.compose.runtime.LaunchedEffect(Unit) {
                runCatching { container.favorites.flushQueue() }
            }
            LocalizedApp(uiLang) {
                AureliusTheme(
                    pref = when (theme) {
                        "light" -> ThemePref.Light
                        "dark" -> ThemePref.Dark
                        else -> ThemePref.System
                    },
                ) {
                    AureliusNav()
                }
            }
        }
    }
}
