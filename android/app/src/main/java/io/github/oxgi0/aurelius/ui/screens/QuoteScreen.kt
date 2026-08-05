package io.github.oxgi0.aurelius.ui.screens

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.zIndex
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.QuoteCard
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.components.Segmented
import io.github.oxgi0.aurelius.ui.components.TopicChips
import io.github.oxgi0.aurelius.ui.theme.LocalColors
import androidx.compose.runtime.collectAsState

@Composable
fun QuoteScreen(nav: NavHostController) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val vm: QuoteViewModel = viewModel { QuoteViewModel(container.quotes, container.settings) }
    val state by vm.state.collectAsState()

    // Fade-Parität: 150 ms raus → Swap → 250 ms rein
    val alpha = remember { Animatable(1f) }
    var displayed by remember { mutableStateOf(state.quote) }
    LaunchedEffect(state.quote) {
        if (displayed.id != state.quote.id) {
            alpha.animateTo(0f, tween(150))
            displayed = state.quote
            alpha.animateTo(1f, tween(250))
        }
    }

    Screen {
        // Header: die Wortmarke ist der Autoren-Umschalter (aktiv = Akzent)
        val isEpiktet = state.author == io.github.oxgi0.aurelius.data.Author.Epiktet
        Row(
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Spacer(Modifier.width(24.dp))
            Row(
                modifier = Modifier.weight(1f),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = "AURELIUS",
                    fontSize = 13.sp,
                    letterSpacing = 5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (!isEpiktet) colors.accent else colors.textSoft,
                    modifier = Modifier.clickable {
                        vm.selectAuthor(io.github.oxgi0.aurelius.data.Author.Aurel)
                    },
                )
                Text(
                    text = "·",
                    fontSize = 13.sp,
                    color = colors.textSoft,
                    modifier = Modifier.padding(horizontal = 10.dp),
                )
                Text(
                    text = "EPIKTET",
                    fontSize = 13.sp,
                    letterSpacing = 5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isEpiktet) colors.accent else colors.textSoft,
                    modifier = Modifier.clickable {
                        vm.selectAuthor(io.github.oxgi0.aurelius.data.Author.Epiktet)
                    },
                )
            }
            Icon(
                Icons.Outlined.Settings,
                contentDescription = stringResource(R.string.acc_settings),
                tint = colors.accent,
                modifier = Modifier.size(20.dp).clickable { nav.navigate("settings") },
            )
        }

        // Medaillon ragt 44dp in die Karte hinein — wechselt mit dem Autor
        Column(
            modifier = Modifier.alpha(alpha.value),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            val isEpiktet = state.author == io.github.oxgi0.aurelius.data.Author.Epiktet
            Image(
                painter = painterResource(
                    if (isEpiktet) R.drawable.epictetus else R.drawable.marcus_medallion
                ),
                contentDescription = stringResource(
                    if (isEpiktet) R.string.acc_engraving else R.string.acc_bust
                ),
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .size(88.dp)
                    .offset(y = 44.dp)
                    .zIndex(2f)
                    .clip(CircleShape)
                    .border(2.dp, colors.accent, CircleShape),
            )
            // Kein Tap-to-Next mehr: Text soll markier-/kopierbar sein (User-Wunsch)
            QuoteCard(
                quote = displayed,
                lang = state.quoteLang,
                topInset = 64.dp,
            )
        }

        Column(
            modifier = Modifier.padding(top = 20.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            TopicChips(container.quotes.topics, state.topicId) { vm.selectTopic(it) }

            Row(
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
                    langs.indexOf(state.quoteLang),
                ) { i -> vm.setQuoteLang(langs[i]) }
                io.github.oxgi0.aurelius.ui.components.FavoriteStar(displayed.id)
            }

            Text(
                text = stringResource(R.string.btn_next),
                color = colors.accent,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .border(1.5.dp, colors.accent, RoundedCornerShape(999.dp))
                    .clickable { vm.drawNext() }
                    .padding(horizontal = 24.dp, vertical = 11.dp),
            )

            io.github.oxgi0.aurelius.ui.components.ExplainSection(displayed, state.quoteLang)
        }
    }
}
