package io.github.oxgi0.aurelius.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.theme.LocalColors
import kotlinx.coroutines.launch

/**
 * Favoriten-Stern — beobachtet den globalen Favoriten-Flow (Verbesserung
 * gegenüber der Expo-App, wo jeder Stern seinen Zustand einzeln lud).
 */
@Composable
fun FavoriteStar(quoteId: String, size: Dp = 22.dp) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val favorites by container.favorites.favorites.collectAsState(initial = emptyList())
    val active = quoteId in favorites
    val scope = rememberCoroutineScope()

    Icon(
        imageVector = if (active) Icons.Filled.Star else Icons.Outlined.StarOutline,
        contentDescription = stringResource(if (active) R.string.fav_remove else R.string.fav_add),
        tint = colors.accent,
        modifier = Modifier
            .size(size)
            .clickable { scope.launch { container.favorites.toggle(quoteId) } },
    )
}
