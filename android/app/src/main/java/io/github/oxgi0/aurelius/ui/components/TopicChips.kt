package io.github.oxgi0.aurelius.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawWithContent
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.data.Topic
import io.github.oxgi0.aurelius.ui.theme.LocalColors

fun topicLabelRes(id: String): Int = when (id) {
    "tod" -> R.string.topic_tod
    "wut" -> R.string.topic_wut
    "trauer" -> R.string.topic_trauer
    "angst" -> R.string.topic_angst
    "familie" -> R.string.topic_familie
    "besitz" -> R.string.topic_besitz
    "gelassenheit" -> R.string.topic_gelassenheit
    "pflicht" -> R.string.topic_pflicht
    "natur" -> R.string.topic_natur
    else -> R.string.topic_all
}

/**
 * Horizontale Themen-Chips: „Alle" + 9 Themen; aktiv = Akzent-Hintergrund mit
 * bg-Text. Verlaufs-Hinweis an den Kanten signalisiert, dass die Reihe
 * seitlich weitergeht (User-Feedback vom 2026-08-05).
 */
@Composable
fun TopicChips(topics: List<Topic>, selectedId: String?, onSelect: (String?) -> Unit) {
    val colors = LocalColors.current
    val scroll = rememberScrollState()
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .drawWithContent {
                drawContent()
                val fade = 28.dp.toPx()
                if (scroll.canScrollForward) {
                    drawRect(
                        brush = Brush.horizontalGradient(
                            colors = listOf(Color.Transparent, colors.bg),
                            startX = size.width - fade,
                            endX = size.width,
                        ),
                    )
                }
                if (scroll.canScrollBackward) {
                    drawRect(
                        brush = Brush.horizontalGradient(
                            colors = listOf(colors.bg, Color.Transparent),
                            startX = 0f,
                            endX = fade,
                        ),
                    )
                }
            },
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().horizontalScroll(scroll),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Chip(stringResource(R.string.topic_all), selectedId == null) { onSelect(null) }
            topics.forEach { topic ->
                Chip(stringResource(topicLabelRes(topic.id)), selectedId == topic.id) { onSelect(topic.id) }
            }
        }
    }
}

@Composable
private fun Chip(label: String, active: Boolean, onClick: () -> Unit) {
    val colors = LocalColors.current
    val pill = RoundedCornerShape(999.dp)
    Text(
        text = label,
        fontSize = 12.sp,
        fontWeight = FontWeight.SemiBold,
        color = if (active) colors.bg else colors.textSoft,
        modifier = Modifier
            .clip(pill)
            .background(if (active) colors.accent else colors.card)
            .border(1.dp, if (active) colors.accent else colors.border, pill)
            .clickable { onClick() }
            .padding(horizontal = 13.dp, vertical = 7.dp),
    )
}
