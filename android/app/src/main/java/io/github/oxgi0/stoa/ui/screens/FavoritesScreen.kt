package io.github.oxgi0.stoa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import io.github.oxgi0.stoa.AureliusApp
import io.github.oxgi0.stoa.R
import io.github.oxgi0.stoa.data.referenceLabel
import io.github.oxgi0.stoa.ui.components.FavoriteStar
import io.github.oxgi0.stoa.ui.components.H1
import io.github.oxgi0.stoa.ui.components.Screen
import io.github.oxgi0.stoa.ui.components.SubLine
import io.github.oxgi0.stoa.ui.theme.FrauncesMedium
import io.github.oxgi0.stoa.ui.theme.FrauncesSemiBold
import io.github.oxgi0.stoa.ui.theme.LocalColors

@Composable
fun FavoritesScreen(nav: NavHostController) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val favoriteIds by container.favorites.favorites.collectAsState(initial = emptyList())
    val quoteLang by container.settings.quoteLang.collectAsState(initial = "de")
    val quotes = favoriteIds.mapNotNull { container.quotes.byId(it) }
    val shape = RoundedCornerShape(14.dp)

    if (quotes.isEmpty()) {
        Screen(center = true) {
            Icon(
                Icons.Outlined.StarOutline,
                contentDescription = null,
                tint = colors.accent,
                modifier = Modifier.size(40.dp),
            )
            Text(
                text = stringResource(R.string.fav_empty_title),
                fontFamily = FrauncesSemiBold,
                fontSize = 22.sp,
                color = colors.text,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 12.dp),
            )
            Text(
                text = stringResource(R.string.fav_empty_text),
                fontSize = 14.sp,
                lineHeight = 21.sp,
                color = colors.textSoft,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 6.dp),
            )
        }
        return
    }

    Screen {
        H1(stringResource(R.string.fav_title))
        SubLine(
            "${quotes.size} " + stringResource(
                if (quotes.size == 1) R.string.fav_one else R.string.fav_many
            )
        )

        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            quotes.forEach { q ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(shape)
                        .background(colors.card)
                        .border(1.dp, colors.border, shape)
                        .clickable { nav.navigate("read/${q.id}") }
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Column(Modifier.weight(1f)) {
                        Text(
                            text = referenceLabel(
                                q,
                                stringResource(R.string.ref_book),
                                stringResource(R.string.ref_manual),
                            ).uppercase(),
                            color = colors.accent,
                            fontSize = 11.sp,
                            letterSpacing = 2.sp,
                            fontWeight = FontWeight.SemiBold,
                        )
                        // Bewusste Verbesserung ggü. Expo: Vorschau folgt der Zitat-Sprache
                        Text(
                            text = q.texts[quoteLang] ?: q.texts.getValue("de"),
                            fontFamily = FrauncesMedium,
                            fontSize = 16.sp,
                            lineHeight = 24.sp,
                            color = colors.text,
                            maxLines = 3,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                    }
                    Spacer(Modifier.width(12.dp))
                    FavoriteStar(q.id, size = 20.dp)
                }
            }
        }
    }
}
