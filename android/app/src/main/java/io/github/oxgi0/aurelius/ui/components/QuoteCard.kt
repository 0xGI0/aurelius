package io.github.oxgi0.aurelius.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.data.Quote
import io.github.oxgi0.aurelius.data.formatReference
import io.github.oxgi0.aurelius.ui.theme.FrauncesMedium
import io.github.oxgi0.aurelius.ui.theme.GfsDidot
import io.github.oxgi0.aurelius.ui.theme.LocalColors

/**
 * Zitatkarte in Parität zur Expo-App: Border 1/Radius 20/Padding 28,
 * minHeight 220, maxHeight 460 mit innerem Scroll; de/en Fraunces 23/36,
 * grc GFS Didot 22/34; Referenz uppercase in Akzent darunter.
 */
@Composable
fun QuoteCard(
    quote: Quote,
    lang: String,
    topInset: Dp = 28.dp,
    onTap: (() -> Unit)? = null,
) {
    val colors = LocalColors.current
    val shape = RoundedCornerShape(20.dp)
    val greek = lang == "grc"
    val hint = stringResource(R.string.hint_tap)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(shape)
            .background(colors.card)
            .border(1.dp, colors.border, shape)
            .let { m -> if (onTap != null) m.clickable(onClickLabel = hint) { onTap() } else m }
            .padding(start = 28.dp, end = 28.dp, bottom = 28.dp, top = topInset),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Column(
            modifier = Modifier
                .heightIn(min = 164.dp, max = 460.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text(
                text = quote.texts[lang] ?: quote.texts.getValue("de"),
                color = colors.text,
                textAlign = TextAlign.Center,
                fontFamily = if (greek) GfsDidot else FrauncesMedium,
                fontWeight = if (greek) FontWeight.Normal else FontWeight.Medium,
                fontSize = if (greek) 22.sp else 23.sp,
                lineHeight = if (greek) 34.sp else 36.sp,
            )
        }
        Text(
            text = formatReference(quote, stringResource(R.string.ref_book)).uppercase(),
            color = colors.accent,
            fontSize = 12.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = 18.dp),
        )
    }
}
