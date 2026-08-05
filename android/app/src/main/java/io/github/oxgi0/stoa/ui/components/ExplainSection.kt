package io.github.oxgi0.stoa.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import io.github.oxgi0.stoa.AureliusApp
import io.github.oxgi0.stoa.R
import io.github.oxgi0.stoa.data.Quote
import io.github.oxgi0.stoa.net.ExplainException
import io.github.oxgi0.stoa.ui.theme.LocalColors
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.onCompletion
import kotlinx.coroutines.launch

/**
 * Erklären-Button + Streaming-Text. Verbesserung ggü. Expo: bei Abbruch
 * bleibt der bisherige Text stehen, der Fehler erscheint darunter.
 */
@Composable
fun ExplainSection(quote: Quote, quoteLang: String) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val scope = rememberCoroutineScope()

    val uiLang by container.settings.uiLang.collectAsState(initial = "de")
    var text by remember(quote.id) { mutableStateOf("") }
    var busy by remember(quote.id) { mutableStateOf(false) }
    var errorKind by remember(quote.id) { mutableStateOf<String?>(null) }
    val job = remember(quote.id) { mutableStateOf<Job?>(null) }

    // Zitatwechsel: laufenden Stream verwerfen (requestId-Parität)
    LaunchedEffect(quote.id) { job.value?.cancel() }

    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = stringResource(R.string.btn_explain),
            color = colors.bg,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .alpha(if (busy) 0.6f else 1f)
                .clip(RoundedCornerShape(999.dp))
                .background(colors.accent)
                .clickable(enabled = !busy) {
                    text = ""; errorKind = null; busy = true
                    job.value = scope.launch {
                        container.explain
                            .explainStream(quote, quoteLang, uiLang, container.secrets.anthropicKey)
                            .catch { e ->
                                errorKind = (e as? ExplainException)?.kind ?: "server"
                            }
                            .onCompletion { busy = false }
                            .collect { chunk -> text += chunk }
                    }
                }
                .padding(horizontal = 28.dp, vertical = 12.dp),
        )

        if (text.isNotEmpty() || busy) {
            StreamingText(text = text, busy = busy)
        }

        errorKind?.let { kind ->
            Text(
                text = stringResource(
                    when (kind) {
                        "offline" -> R.string.err_offline
                        "auth" -> R.string.err_auth
                        "rate_limited" -> R.string.err_rate
                        "not_configured" -> R.string.err_not_configured
                        else -> R.string.err_server
                    }
                ),
                color = colors.accent,
                fontSize = 14.sp,
                lineHeight = 20.sp,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 12.dp),
            )
        }
    }
}

@Composable
fun StreamingText(text: String, busy: Boolean) {
    val colors = LocalColors.current
    val cursorAlpha = remember { Animatable(1f) }
    LaunchedEffect(busy) {
        while (busy) {
            cursorAlpha.animateTo(0f, tween(450))
            cursorAlpha.animateTo(1f, tween(450))
        }
        cursorAlpha.snapTo(1f)
    }
    Column(modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
        Text(
            text = buildString {
                append(text)
                if (busy) append(" ")
            },
            color = colors.text,
            fontSize = 16.sp,
            lineHeight = 26.sp,
        )
        if (busy) {
            Text(
                text = "▌",
                color = colors.accent,
                modifier = Modifier.alpha(cursorAlpha.value),
            )
        }
    }
}
