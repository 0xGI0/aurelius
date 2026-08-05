package io.github.oxgi0.aurelius.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.H1
import io.github.oxgi0.aurelius.ui.components.Kicker
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.theme.LocalColors

@Composable
fun AurelScreen() {
    val colors = LocalColors.current
    val shape = RoundedCornerShape(16.dp)

    Screen {
        Image(
            painter = painterResource(R.drawable.marcus_portrait),
            contentDescription = stringResource(R.string.acc_bust),
            contentScale = ContentScale.Crop,
            modifier = Modifier
                .fillMaxWidth()
                .widthIn(max = 320.dp)
                .aspectRatio(3f / 4f)
                .clip(shape)
                .border(1.dp, colors.border, shape),
        )
        // H1 hart „Marc Aurel" — im Original nicht übersetzt
        Text(
            text = "Marc Aurel",
            fontSize = 30.sp,
            fontFamily = io.github.oxgi0.aurelius.ui.theme.FrauncesSemiBold,
            color = colors.text,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
        )
        Text(
            text = stringResource(R.string.aurel_sub),
            fontSize = 13.sp,
            letterSpacing = 1.sp,
            color = colors.textSoft,
            textAlign = TextAlign.Center,
            modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
        )

        Section(R.string.aurel_s1_title, R.string.aurel_s1)
        Section(R.string.aurel_s2_title, R.string.aurel_s2)
        Section(R.string.aurel_s3_title, R.string.aurel_s3)

        Text(
            text = stringResource(R.string.aurel_credit),
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
