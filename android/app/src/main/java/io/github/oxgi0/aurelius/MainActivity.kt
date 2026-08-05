package io.github.oxgi0.aurelius

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import io.github.oxgi0.aurelius.ui.nav.AureliusNav
import io.github.oxgi0.aurelius.ui.theme.AureliusTheme
import io.github.oxgi0.aurelius.ui.theme.ThemePref

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AureliusTheme(pref = ThemePref.System) {
                AureliusNav()
            }
        }
    }
}
