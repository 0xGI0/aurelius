package io.github.oxgi0.aurelius.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import io.github.oxgi0.aurelius.AureliusApp
import io.github.oxgi0.aurelius.R
import io.github.oxgi0.aurelius.ui.components.Screen
import io.github.oxgi0.aurelius.ui.components.Segmented
import io.github.oxgi0.aurelius.ui.theme.LocalColors
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(nav: NavHostController) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val settings = container.settings
    val secrets = container.secrets
    val scope = rememberCoroutineScope()

    var uiLang by remember { mutableStateOf("de") }
    var quoteLang by remember { mutableStateOf("de") }
    var theme by remember { mutableStateOf("system") }
    var hasKey by remember { mutableStateOf(secrets.anthropicKey != null) }
    var keyInput by remember { mutableStateOf("") }
    var savedNote by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        uiLang = settings.uiLang.first()
        quoteLang = settings.quoteLang.first()
        theme = settings.themePref.first()
    }
    LaunchedEffect(savedNote) {
        if (savedNote) { delay(2000); savedNote = false }
    }

    Screen(header = {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = stringResource(R.string.set_title),
                fontSize = 24.sp, fontWeight = FontWeight.Bold, color = colors.text,
            )
            Spacer(Modifier.weight(1f))
            Text(
                text = stringResource(R.string.set_done),
                color = colors.accent, fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { nav.popBackStack() },
            )
        }
    }) {
        SectionTitle(stringResource(R.string.set_ui_lang))
        // Labels hart wie im Original (nicht übersetzt)
        Segmented(listOf("Deutsch", "English"), if (uiLang == "en") 1 else 0) { i ->
            uiLang = if (i == 1) "en" else "de"
            scope.launch { settings.setUiLang(uiLang) }
        }

        SectionTitle(stringResource(R.string.set_quote_lang))
        val quoteLangs = listOf("de", "en", "grc")
        Segmented(
            listOf(stringResource(R.string.lang_de), stringResource(R.string.lang_en), stringResource(R.string.lang_grc)),
            quoteLangs.indexOf(quoteLang),
        ) { i ->
            quoteLang = quoteLangs[i]
            scope.launch { settings.setQuoteLang(quoteLang) }
        }

        SectionTitle(stringResource(R.string.set_appearance))
        val themes = listOf("light", "dark", "system")
        Segmented(
            listOf(stringResource(R.string.set_light), stringResource(R.string.set_dark), stringResource(R.string.set_system)),
            themes.indexOf(theme),
        ) { i ->
            theme = themes[i]
            scope.launch { settings.setThemePref(theme) }
        }

        SectionTitle(stringResource(R.string.set_ai))
        Text(
            text = stringResource(R.string.set_ai_hint),
            color = colors.textSoft, fontSize = 14.sp, lineHeight = 20.sp,
            modifier = Modifier.fillMaxWidth(),
        )
        if (hasKey) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(stringResource(R.string.set_key_stored), color = colors.text)
                Spacer(Modifier.weight(1f))
                Text(
                    text = stringResource(R.string.set_key_delete),
                    color = colors.accent, fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable {
                        secrets.anthropicKey = null
                        hasKey = false
                    },
                )
            }
        } else {
            OutlinedTextField(
                value = keyInput,
                onValueChange = { keyInput = it },
                placeholder = { Text("sk-ant-…", color = colors.textSoft) },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = colors.accent,
                    unfocusedBorderColor = colors.border,
                    focusedTextColor = colors.text,
                    unfocusedTextColor = colors.text,
                    focusedContainerColor = colors.card,
                    unfocusedContainerColor = colors.card,
                ),
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp),
            )
            Text(
                text = if (savedNote) stringResource(R.string.set_key_saved) else stringResource(R.string.set_key_save),
                color = colors.bg,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .padding(top = 10.dp)
                    .clip(RoundedCornerShape(999.dp))
                    .background(colors.accent)
                    .clickable {
                        val trimmed = keyInput.trim()
                        if (trimmed.isNotEmpty()) {
                            secrets.anthropicKey = trimmed
                            keyInput = ""
                            hasKey = true
                            savedNote = true
                        }
                    }
                    .padding(horizontal = 24.dp, vertical = 11.dp),
            )
        }

        SectionTitle(stringResource(R.string.set_sources))
        Text(
            text = stringResource(R.string.set_sources_text),
            color = colors.textSoft, fontSize = 12.sp, lineHeight = 18.sp,
            modifier = Modifier.fillMaxWidth(),
        )
    }
}

@Composable
private fun SectionTitle(text: String) {
    val colors = LocalColors.current
    Text(
        text = text.uppercase(),
        color = colors.accent,
        fontSize = 12.sp,
        letterSpacing = 2.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.fillMaxWidth().padding(top = 20.dp, bottom = 10.dp),
    )
}
