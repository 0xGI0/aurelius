package io.github.oxgi0.aurelius.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.H1
import io.github.oxgi0.aurelius.ui.components.Kicker
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.components.Segmented
import io.github.oxgi0.aurelius.ui.theme.FrauncesSemiBold
import io.github.oxgi0.aurelius.ui.theme.LocalColors
import kotlinx.coroutines.launch

/** „Die Stoiker": Biografie des gewählten Autors + Unterschiede-Vergleich. */
@Composable
fun AurelScreen() {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val author by container.settings.author.collectAsState(initial = "aurel")
    val scope = rememberCoroutineScope()
    val shape = RoundedCornerShape(16.dp)
    val cardShape = RoundedCornerShape(14.dp)

    Screen {
        val authorKeys = listOf("aurel", "epiktet", "seneca")
        Segmented(
            listOf(
                stringResource(R.string.author_aurel),
                stringResource(R.string.author_epiktet),
                stringResource(R.string.author_seneca),
            ),
            authorKeys.indexOf(author).coerceAtLeast(0),
        ) { i ->
            scope.launch { container.settings.setAuthor(authorKeys[i]) }
        }

        Image(
            painter = painterResource(
                when (author) {
                    "epiktet" -> R.drawable.epictetus
                    "seneca" -> R.drawable.seneca
                    else -> R.drawable.marcus_portrait
                }
            ),
            contentDescription = stringResource(
                when (author) {
                    "epiktet" -> R.string.acc_engraving
                    "seneca" -> R.string.acc_seneca_bust
                    else -> R.string.acc_bust
                }
            ),
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .padding(top = 16.dp)
                .fillMaxWidth()
                .widthIn(max = 320.dp)
                .aspectRatio(3f / 4f)
                .clip(shape)
                .border(1.dp, colors.border, shape),
        )
        Text(
            text = when (author) {
                "epiktet" -> "Epiktet"
                "seneca" -> "Seneca"
                else -> "Marc Aurel"
            },
            fontSize = 30.sp,
            fontFamily = FrauncesSemiBold,
            color = colors.text,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
        )
        Text(
            text = stringResource(
                when (author) {
                    "epiktet" -> R.string.epik_sub
                    "seneca" -> R.string.seneca_sub
                    else -> R.string.aurel_sub
                }
            ),
            fontSize = 13.sp,
            letterSpacing = 1.sp,
            color = colors.textSoft,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
        )

        when (author) {
            "epiktet" -> {
                Section(R.string.epik_s1_title, R.string.epik_s1)
                Section(R.string.epik_s2_title, R.string.epik_s2)
                Section(R.string.epik_s3_title, R.string.epik_s3)
            }
            "seneca" -> {
                Section(R.string.seneca_s1_title, R.string.seneca_s1)
                Section(R.string.seneca_s2_title, R.string.seneca_s2)
                Section(R.string.seneca_s3_title, R.string.seneca_s3)
            }
            else -> {
                Section(R.string.aurel_s1_title, R.string.aurel_s1)
                Section(R.string.aurel_s2_title, R.string.aurel_s2)
                Section(R.string.aurel_s3_title, R.string.aurel_s3)
            }
        }

        H1(stringResource(R.string.diff_title), size = 24)
        listOf(
            R.string.diff1_title to R.string.diff1,
            R.string.diff2_title to R.string.diff2,
            R.string.diff3_title to R.string.diff3,
        ).forEach { (titleRes, bodyRes) ->
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp)
                    .clip(cardShape)
                    .background(colors.card)
                    .border(1.dp, colors.border, cardShape)
                    .padding(horizontal = 18.dp, vertical = 14.dp),
            ) {
                Text(
                    text = stringResource(titleRes).uppercase(),
                    color = colors.accent,
                    fontSize = 11.sp,
                    letterSpacing = 2.sp,
                    fontWeight = androidx.compose.ui.text.font.FontWeight.SemiBold,
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

        Text(
            text = stringResource(
                when (author) {
                    "epiktet" -> R.string.epik_credit
                    "seneca" -> R.string.seneca_credit
                    else -> R.string.aurel_credit
                }
            ),
            fontSize = 11.sp,
            color = colors.textSoft,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(top = 24.dp),
        )
    }
}

@Composable
private fun Section(titleRes: Int, bodyRes: Int) {
    val colors = LocalColors.current
    Kicker(stringResource(titleRes))
    Text(
        text = stringResource(bodyRes),
        fontSize = 16.sp,
        lineHeight = 26.sp,
        color = colors.text,
        modifier = Modifier.fillMaxWidth(),
    )
}
