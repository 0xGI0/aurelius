@file:OptIn(ExperimentalTextApi::class)

package io.github.oxgi0.stoa.ui.theme

import androidx.compose.ui.text.ExperimentalTextApi
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import io.github.oxgi0.stoa.R

/**
 * Parität zur Expo-App: quote = Fraunces Medium, display = Fraunces SemiBold,
 * greek = GFS Didot. Fraunces liegt als Variable Font vor; die Gewichte werden
 * über die wght-Achse instanziert (min API 26 garantiert Unterstützung).
 */
val FrauncesMedium = FontFamily(
    Font(
        R.font.fraunces_variable,
        weight = FontWeight.Medium,
        variationSettings = FontVariation.Settings(FontVariation.weight(500)),
    )
)

val FrauncesSemiBold = FontFamily(
    Font(
        R.font.fraunces_variable,
        weight = FontWeight.SemiBold,
        variationSettings = FontVariation.Settings(FontVariation.weight(600)),
    )
)

val GfsDidot = FontFamily(Font(R.font.gfs_didot))
