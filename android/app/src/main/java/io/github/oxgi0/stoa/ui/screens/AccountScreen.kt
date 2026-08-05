package io.github.oxgi0.stoa.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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
import io.github.oxgi0.stoa.AureliusApp
import io.github.oxgi0.stoa.BuildConfig
import io.github.oxgi0.stoa.R
import io.github.oxgi0.stoa.net.ApiError
import io.github.oxgi0.stoa.net.EmailBody
import io.github.oxgi0.stoa.net.LoginBody
import io.github.oxgi0.stoa.net.RegisterBody
import io.github.oxgi0.stoa.net.apiCall
import io.github.oxgi0.stoa.ui.components.BackHeader
import io.github.oxgi0.stoa.ui.components.H1
import io.github.oxgi0.stoa.ui.components.Screen
import io.github.oxgi0.stoa.ui.theme.LocalColors
import kotlinx.coroutines.launch

@Composable
fun AccountScreen(nav: NavHostController) {
    val colors = LocalColors.current
    val container = (LocalContext.current.applicationContext as AureliusApp).container
    val secrets = container.secrets
    val scope = rememberCoroutineScope()

    var loggedInEmail by remember { mutableStateOf(secrets.email.takeIf { secrets.token != null }) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var status by remember { mutableStateOf<String?>(null) }
    var busy by remember { mutableStateOf(false) }

    val offlineText = stringResource(R.string.acc_offline)
    val serverText = stringResource(R.string.err_server)
    val verifySent = stringResource(R.string.acc_verify_sent)
    val resetSent = stringResource(R.string.acc_reset_sent)

    fun errorText(e: Exception): String = when (e) {
        is ApiError.Offline -> offlineText
        is ApiError.Validation -> e.detail
        is ApiError.Unauthorized -> serverText
        else -> serverText
    }

    Screen(header = { BackHeader { nav.popBackStack() } }) {
        H1(stringResource(R.string.acc_title))
        Text(
            text = stringResource(R.string.acc_hint),
            color = colors.textSoft, fontSize = 14.sp, lineHeight = 20.sp,
            modifier = Modifier.fillMaxWidth().padding(bottom = 16.dp),
        )

        if (BuildConfig.BACKEND_URL.isBlank()) {
            Text(stringResource(R.string.acc_no_server), color = colors.textSoft)
            return@Screen
        }

        if (loggedInEmail != null) {
            Text(
                text = "${stringResource(R.string.acc_logged_in_as)} $loggedInEmail",
                color = colors.text, fontWeight = FontWeight.SemiBold,
            )
            Text(
                text = stringResource(R.string.acc_synced),
                color = colors.textSoft, fontSize = 14.sp,
                modifier = Modifier.padding(top = 6.dp),
            )
            Pill(stringResource(R.string.acc_logout)) {
                scope.launch {
                    runCatching { apiCall { container.api.logout() } }
                    secrets.token = null
                    secrets.email = null
                    loggedInEmail = null
                }
            }
        } else {
            val fieldColors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = colors.accent,
                unfocusedBorderColor = colors.border,
                focusedTextColor = colors.text,
                unfocusedTextColor = colors.text,
                focusedContainerColor = colors.card,
                unfocusedContainerColor = colors.card,
            )
            OutlinedTextField(
                value = email, onValueChange = { email = it },
                placeholder = { Text(stringResource(R.string.acc_email), color = colors.textSoft) },
                singleLine = true, shape = RoundedCornerShape(12.dp), colors = fieldColors,
                modifier = Modifier.fillMaxWidth(),
            )
            OutlinedTextField(
                value = password, onValueChange = { password = it },
                placeholder = { Text(stringResource(R.string.acc_password), color = colors.textSoft) },
                visualTransformation = PasswordVisualTransformation(),
                singleLine = true, shape = RoundedCornerShape(12.dp), colors = fieldColors,
                modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
            )

            Row(modifier = Modifier.padding(top = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                Pill(stringResource(R.string.acc_login), enabled = !busy) {
                    scope.launch {
                        busy = true; status = null
                        try {
                            val resp = apiCall { container.api.login(LoginBody(email.trim(), password)) }
                            secrets.token = resp.key
                            secrets.email = email.trim()
                            loggedInEmail = email.trim()
                            container.favorites.onLogin(container.api)
                        } catch (e: Exception) {
                            status = errorText(e)
                        } finally { busy = false }
                    }
                }
                Spacer(Modifier.width(10.dp))
                Pill(stringResource(R.string.acc_register), enabled = !busy, outline = true) {
                    scope.launch {
                        busy = true; status = null
                        try {
                            apiCall { container.api.register(RegisterBody(email.trim(), password, password)) }
                            status = verifySent
                        } catch (e: Exception) {
                            status = errorText(e)
                        } finally { busy = false }
                    }
                }
            }

            Text(
                text = stringResource(R.string.acc_forgot),
                color = colors.accent, fontSize = 13.sp,
                modifier = Modifier.padding(top = 14.dp).clickable(enabled = !busy) {
                    scope.launch {
                        busy = true; status = null
                        try {
                            apiCall { container.api.passwordReset(EmailBody(email.trim())) }
                            status = resetSent
                        } catch (e: Exception) {
                            status = errorText(e)
                        } finally { busy = false }
                    }
                },
            )
        }

        status?.let {
            Text(
                text = it,
                color = colors.accent, fontSize = 14.sp, lineHeight = 20.sp,
                modifier = Modifier.padding(top = 16.dp),
            )
        }
    }
}

@Composable
private fun Pill(label: String, enabled: Boolean = true, outline: Boolean = false, onClick: () -> Unit) {
    val colors = LocalColors.current
    val shape = RoundedCornerShape(999.dp)
    Text(
        text = label,
        color = if (outline) colors.accent else colors.bg,
        fontWeight = FontWeight.Bold,
        modifier = Modifier
            .clip(shape)
            .background(if (outline) colors.card else colors.accent)
            .then(
                if (outline) Modifier.border(1.5.dp, colors.accent, shape) else Modifier
            )
            .clickable(enabled = enabled) { onClick() }
            .padding(horizontal = 24.dp, vertical = 11.dp),
    )
}
