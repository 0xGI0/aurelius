package io.github.oxgi0.aurelius.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.ui.theme.LocalColors

/** Pill-Umschalter in Parität zur Expo-App (components: Segmented). */
@Composable
fun Segmented(options: List<String>, selectedIndex: Int, onSelect: (Int) -> Unit) {
    val colors = LocalColors.current
    val pill = RoundedCornerShape(999.dp)
    Row(
        modifier = Modifier
            .clip(pill)
            .background(colors.card)
            .border(1.dp, colors.border, pill)
            .padding(3.dp),
        horizontalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        options.forEachIndexed { i, label ->
            val active = i == selectedIndex
            Text(
                text = label,
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (active) colors.card else colors.textSoft,
                modifier = Modifier
                    .clip(pill)
                    .background(if (active) colors.accent else colors.card)
                    .clickable { onSelect(i) }
                    .padding(horizontal = 14.dp, vertical = 6.dp)
                    .semantics { selected = active },
            )
        }
    }
}
