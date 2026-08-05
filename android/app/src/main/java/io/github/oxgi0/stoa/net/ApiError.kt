package io.github.oxgi0.stoa.net

import java.io.IOException
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.HttpException

sealed class ApiError : Exception() {
    object Offline : ApiError() { private fun readResolve(): Any = Offline }
    data class Validation(val detail: String) : ApiError()
    object Unauthorized : ApiError() { private fun readResolve(): Any = Unauthorized }
    object RateLimited : ApiError() { private fun readResolve(): Any = RateLimited }
    object Server : ApiError() { private fun readResolve(): Any = Server }
}

/** Führt einen API-Aufruf aus und übersetzt Fehler in ApiError. */
suspend fun <T> apiCall(block: suspend () -> T): T = try {
    block()
} catch (e: IOException) {
    throw ApiError.Offline
} catch (e: HttpException) {
    throw when (e.code()) {
        400 -> ApiError.Validation(parseFieldErrors(e))
        401 -> ApiError.Unauthorized
        429 -> ApiError.RateLimited
        else -> ApiError.Server
    }
}

/** DRF-Fehlerformat: {"feld": ["text", …], …} oder {"detail": "text"} → lesbarer Satz. */
private fun parseFieldErrors(e: HttpException): String = try {
    val body = e.response()?.errorBody()?.string().orEmpty()
    val obj = Json.parseToJsonElement(body).jsonObject
    obj.entries.joinToString(" ") { (_, value) ->
        runCatching { value.jsonArray.joinToString(" ") { it.jsonPrimitive.content } }
            .getOrElse { runCatching { value.jsonPrimitive.content }.getOrDefault("") }
    }.ifBlank { "Ungültige Eingabe." }
} catch (_: Exception) {
    "Ungültige Eingabe."
}
