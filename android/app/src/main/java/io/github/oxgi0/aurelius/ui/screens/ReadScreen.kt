package io.github.oxgi0.aurelius.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.BackHeader
import io.github.oxgi0.aurelius.ui.components.QuoteCard
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.components.Segmented
import io.github.oxgi0.aurelius.ui.theme.LocalColors
import kotlinx.coroutines.launch

@Composable
fun ReadScreen(nav: NavHostController, quoteId: String) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val quote = container.quotes.byId(quoteId)
    val quoteLang by container.settings.quoteLang.collectAsState(initial = "de")
    val scope = rememberCoroutineScope()

    if (quote == null) {
        Screen(header = { BackHeader { nav.popBackStack() } }, center = true) {
            Text(stringResource(R.string.section_not_found), color = colors.textSoft)
        }
        return
    }

    Screen(header = { BackHeader { nav.popBackStack() } }, center = true) {
        QuoteCard(quote = quote, lang = quoteLang)

        Row(
            modifier = Modifier.padding(top = 20.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            val langs = listOf("de", "en", "grc")
            Segmented(
                listOf(
                    stringResource(R.string.lang_de),
                    stringResource(R.string.lang_en),
                    stringResource(R.string.lang_grc),
                ),
                langs.indexOf(quoteLang),
            ) { i -> scope.launch { container.settings.setQuoteLang(langs[i]) } }
            // FavoriteStar folgt in Task 7
        }

        // ExplainSection folgt in Task 10
    }
}
