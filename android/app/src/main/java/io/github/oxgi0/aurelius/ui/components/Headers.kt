package io.github.oxgi0.aurelius.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronLeft
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.theme.FrauncesSemiBold
import io.github.oxgi0.aurelius.ui.theme.LocalColors

/** H1 in Fraunces SemiBold — Parität zu den Titelzeilen der Expo-App. */
@Composable
fun H1(text: String, size: Int = 28, centered: Boolean = false) {
    val colors = LocalColors.current
    Text(
        text = text,
        fontFamily = FrauncesSemiBold,
        fontWeight = FontWeight.SemiBold,
        fontSize = size.sp,
        color = colors.text,
        textAlign = if (centered) TextAlign.Center else TextAlign.Start,
        modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
    )
}

@Composable
fun SubLine(text: String) {
    val colors = LocalColors.current
    Text(
        text = text,
        fontSize = 13.sp,
        letterSpacing = 1.sp,
        color = colors.textSoft,
        modifier = Modifier.fillMaxWidth().padding(bottom = 20.dp),
    )
}

/** Abschnitts-Kicker: uppercase, Akzent, 11–12sp, letterSpacing 2. */
@Composable
fun Kicker(text: String, topPadding: Int = 20) {
    val colors = LocalColors.current
    Text(
        text = text.uppercase(),
        color = colors.accent,
        fontSize = 12.sp,
        letterSpacing = 2.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.fillMaxWidth().padding(top = topPadding.dp, bottom = 8.dp),
    )
}

@Composable
fun BackHeader(onBack: () -> Unit) {
    val colors = LocalColors.current
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Row(
            modifier = Modifier.clickable { onBack() }.padding(8.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(
                Icons.Filled.ChevronLeft,
                contentDescription = null,
                tint = colors.accent,
                modifier = Modifier.size(20.dp),
            )
            Text(
                text = stringResource(R.string.back),
                color = colors.accent,
                fontWeight = FontWeight.SemiBold,
            )
        }
    }
}
