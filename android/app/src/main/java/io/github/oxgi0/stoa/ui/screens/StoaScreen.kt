package io.github.oxgi0.stoa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.stoa.R
import io.github.oxgi0.stoa.ui.components.H1
import io.github.oxgi0.stoa.ui.components.Kicker
import io.github.oxgi0.stoa.ui.components.Screen
import io.github.oxgi0.stoa.ui.components.SubLine
import io.github.oxgi0.stoa.ui.theme.LocalColors

private val IDEAS = listOf(
    R.string.stoa_i1_title to R.string.stoa_i1,
    R.string.stoa_i2_title to R.string.stoa_i2,
    R.string.stoa_i3_title to R.string.stoa_i3,
    R.string.stoa_i4_title to R.string.stoa_i4,
)

@Composable
fun StoaScreen() {
    val colors = LocalColors.current
    val shape = RoundedCornerShape(14.dp)

    Screen {
        H1(stringResource(R.string.stoa_title))
        SubLine(stringResource(R.string.stoa_sub))
        Text(
            text = stringResource(R.string.stoa_intro),
            fontSize = 16.sp,
            lineHeight = 26.sp,
            color = colors.text,
            modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
        )

        Column(verticalArrangement = Arrangement.spacedBy(10.dp), modifier = Modifier.fillMaxWidth().padding(top = 12.dp)) {
            IDEAS.forEachIndexed { i, (titleRes, bodyRes) ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(shape)
                        .background(colors.card)
                        .border(1.dp, colors.border, shape)
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                ) {
                    Text(
                        text = "${(i + 1).toString().padStart(2, '0')} · ${stringResource(titleRes).uppercase()}",
                        color = colors.accent,
                        fontSize = 11.sp,
                        letterSpacing = 2.sp,
                        fontWeight = FontWeight.SemiBold,
                    )
                    Text(
                        text = stringResource(bodyRes),
                        fontSize = 15.sp,
                        lineHeight = 23.sp,
                        color = colors.text,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                }
            }
        }

        Kicker(stringResource(R.string.stoa_heads_title))
        Text(
            text = stringResource(R.string.stoa_heads),
            fontSize = 16.sp, lineHeight = 26.sp, color = colors.text,
            modifier = Modifier.fillMaxWidth(),
        )
        Kicker(stringResource(R.string.stoa_today_title))
        Text(
            text = stringResource(R.string.stoa_today),
            fontSize = 16.sp, lineHeight = 26.sp, color = colors.text,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}
