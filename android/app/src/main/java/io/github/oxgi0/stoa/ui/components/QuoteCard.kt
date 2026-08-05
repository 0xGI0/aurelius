package io.github.oxgi0.stoa.ui.components

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
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.stoa.R
import io.github.oxgi0.stoa.data.Quote
import io.github.oxgi0.stoa.data.referenceLabel
import io.github.oxgi0.stoa.ui.theme.FrauncesMedium
import io.github.oxgi0.stoa.ui.theme.GfsDidot
import io.github.oxgi0.stoa.ui.theme.LocalColors

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
        // Scroll-Hinweis: Verlauf am unteren/oberen Rand, solange dort Text wartet
        val scroll = rememberScrollState()
        Column(
            modifier = Modifier
                .heightIn(min = 164.dp, max = 460.dp)
                .drawWithContent {
                    drawContent()
                    val fade = 36.dp.toPx()
                    if (scroll.canScrollForward) {
                        drawRect(
                            brush = Brush.verticalGradient(
                                colors = listOf(Color.Transparent, colors.card),
                                startY = size.height - fade,
                                endY = size.height,
                            ),
                        )
                    }
                    if (scroll.canScrollBackward) {
                        drawRect(
                            brush = Brush.verticalGradient(
                                colors = listOf(colors.card, Color.Transparent),
                                startY = 0f,
                                endY = fade,
                            ),
                        )
                    }
                    // Immer sichtbare schmale Scroll-Leiste rechts vom Text
                    if (scroll.maxValue > 0) {
                        val viewH = size.height
                        val total = viewH + scroll.maxValue
                        val barH = kotlin.math.max(24.dp.toPx(), viewH * viewH / total)
                        val barY = (scroll.value.toFloat() / scroll.maxValue) * (viewH - barH)
                        drawRoundRect(
                            color = colors.accent.copy(alpha = 0.4f),
                            topLeft = androidx.compose.ui.geometry.Offset(size.width - 3.dp.toPx(), barY),
                            size = androidx.compose.ui.geometry.Size(3.dp.toPx(), barH),
                            cornerRadius = androidx.compose.ui.geometry.CornerRadius(2.dp.toPx()),
                        )
                    }
                }
                .verticalScroll(scroll),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            androidx.compose.foundation.text.selection.SelectionContainer {
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
        }
        Text(
            text = referenceLabel(
                quote,
                stringResource(R.string.ref_book),
                stringResource(R.string.ref_manual),
            ).uppercase(),
            color = colors.accent,
            fontSize = 12.sp,
            letterSpacing = 2.sp,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.padding(top = 18.dp),
        )
    }
}
