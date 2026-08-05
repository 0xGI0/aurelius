package io.github.oxgi0.stoa.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
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
import io.github.oxgi0.stoa.data.roman
import io.github.oxgi0.stoa.ui.components.BackHeader
import io.github.oxgi0.stoa.ui.components.H1
import io.github.oxgi0.stoa.ui.components.Screen
import io.github.oxgi0.stoa.ui.components.SubLine
import io.github.oxgi0.stoa.ui.theme.FrauncesMedium
import io.github.oxgi0.stoa.ui.theme.LocalColors

@Composable
fun BookScreen(nav: NavHostController, bookNumber: Int) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val quoteLang by container.settings.quoteLang.collectAsState(initial = "de")
    val sections = container.quotes.byBook(bookNumber)

    if (sections.isEmpty()) {
        Screen(header = { BackHeader { nav.popBackStack() } }, center = true) {
            Text(stringResource(R.string.book_not_found), color = colors.textSoft)
        }
        return
    }

    Screen(header = { BackHeader { nav.popBackStack() } }) {
        H1("${stringResource(R.string.ref_book)} ${roman(bookNumber)}")
        SubLine("${sections.size} ${stringResource(R.string.sections)}")

        Column(verticalArrangement = Arrangement.spacedBy(14.dp), modifier = Modifier.fillMaxWidth()) {
            sections.forEach { q ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { nav.navigate("read/${q.id}") },
                ) {
                    Text(
                        text = q.section.toString(),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.accent,
                        textAlign = TextAlign.End,
                        modifier = Modifier.widthIn(min = 24.dp).padding(end = 10.dp),
                    )
                    Text(
                        text = q.texts[quoteLang] ?: q.texts.getValue("de"),
                        fontFamily = FrauncesMedium,
                        fontSize = 15.sp,
                        lineHeight = 22.sp,
                        color = colors.text,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
            }
        }
    }
}
