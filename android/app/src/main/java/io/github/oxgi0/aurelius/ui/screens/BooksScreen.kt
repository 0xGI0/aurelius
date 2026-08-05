package io.github.oxgi0.aurelius.ui.screens

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.data.READING_LIST
import io.github.oxgi0.aurelius.data.roman
import io.github.oxgi0.aurelius.ui.components.H1
import io.github.oxgi0.aurelius.ui.components.Kicker
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.components.SubLine
import io.github.oxgi0.aurelius.ui.theme.FrauncesMedium
import io.github.oxgi0.aurelius.ui.theme.LocalColors

@Composable
fun BooksScreen(nav: NavHostController) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val uiLang by container.settings.uiLang.collectAsState(initial = "de")
    val cardShape = RoundedCornerShape(14.dp)

    Screen {
        H1(stringResource(R.string.books_title))
        SubLine(stringResource(R.string.books_sub))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            container.quotes.books().forEach { (book, count) ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(colors.card)
                        .border(1.dp, colors.border, cardShape)
                        .clickable { nav.navigate("book/$book") }
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Text(
                        text = "${stringResource(R.string.ref_book)} ${roman(book)}",
                        fontFamily = FrauncesMedium,
                        fontSize = 17.sp,
                        color = colors.text,
                    )
                    Spacer(Modifier.weight(1f))
                    Text(
                        text = "$count ${stringResource(R.string.sections)}",
                        fontSize = 13.sp,
                        color = colors.textSoft,
                    )
                    Icon(
                        Icons.Filled.ChevronRight,
                        contentDescription = null,
                        tint = colors.accent,
                        modifier = Modifier.size(16.dp).padding(start = 2.dp),
                    )
                }
            }
        }

        H1(stringResource(R.string.lib_title))
        SubLine(stringResource(R.string.lib_sub))

        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth()) {
            READING_LIST.forEach { item ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(cardShape)
                        .background(colors.card)
                        .border(1.dp, colors.border, cardShape)
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                ) {
                    val eraLabel = stringResource(
                        if (item.era == "Antike") R.string.era_ancient else R.string.era_modern
                    )
                    Text(
                        text = "${item.author} · $eraLabel".uppercase(),
                        color = colors.accent,
                        fontSize = 11.sp,
                        letterSpacing = 2.sp,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = if (uiLang == "en") item.titleEn else item.title,
                        fontFamily = FrauncesMedium,
                        fontSize = 18.sp,
                        color = colors.text,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                    Text(
                        text = if (uiLang == "en") item.noteEn else item.note,
                        fontSize = 14.sp,
                        lineHeight = 21.sp,
                        color = colors.textSoft,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }
        }
    }
}
