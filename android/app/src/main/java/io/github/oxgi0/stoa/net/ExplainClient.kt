package io.github.oxgi0.stoa.net

import io.github.oxgi0.stoa.data.Author
import io.github.oxgi0.stoa.data.Quote
import io.github.oxgi0.stoa.data.authorOf
import io.github.oxgi0.stoa.data.referenceLabel
import java.io.IOException
import java.util.concurrent.TimeUnit
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.put
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okio.Buffer

/** Fehlerarten in Parität zur Expo-App (lib/ai/errors.ts). */
class ExplainException(val kind: String) : Exception(kind)
// kinds: offline | auth | rate_limited | not_configured | server

/**
 * KI-Erklärungen als Text-Chunk-Flow. Mit Anthropic-Key: direkte
 * SSE-Anfrage an die Anthropic-API (BYOK). Ohne Key: der Vercel-Endpoint
 * der Web-App, der rohen text/plain-Stream liefert.
 */
class ExplainClient(
    private val explainUrl: String,
    private val anthropicUrl: String = "https://api.anthropic.com/v1/messages",
    client: OkHttpClient? = null,
) {
    private val http = client ?: OkHttpClient.Builder()
        .readTimeout(0, TimeUnit.MILLISECONDS) // Streaming
        .build()
    private val json = Json { ignoreUnknownKeys = true }
    private val media = "application/json; charset=utf-8".toMediaType()

    fun explainStream(quote: Quote, quoteLang: String, uiLang: String, anthropicKey: String?): Flow<String> {
        val text = quote.texts[quoteLang] ?: quote.texts.getValue("de")
        val author = authorOf(quote.id)
        val reference = if (uiLang == "en") {
            referenceLabel(quote, "Book", "Manual")
        } else {
            referenceLabel(quote, "Buch", "Handbuch")
        }
        return if (anthropicKey != null) {
            anthropicStream(anthropicKey, text, reference, uiLang, author)
        } else {
            geminiStream(text, reference, uiLang, author)
        }
    }

    // Prompts 1:1 aus aurelius/lib/ai/prompt.ts (werk-bewusst)
    private fun workName(uiLang: String, author: Author): String = when (author) {
        Author.Epiktet -> if (uiLang == "en") "Epictetus’ Enchiridion" else "Epiktets Handbüchlein der Moral"
        Author.Seneca -> if (uiLang == "en") "Seneca’s On the Shortness of Life" else "Senecas Schrift Von der Kürze des Lebens"
        Author.Aurel -> if (uiLang == "en") "Marcus Aurelius’ Meditations" else "Marc Aurels Selbstbetrachtungen"
    }

    private fun explainSystem(uiLang: String, author: Author): String = if (uiLang == "en") {
        "You are a knowledgeable, level-headed companion through ${workName(uiLang, author)}. " +
            "You explain clearly, concretely and without kitsch — for interested lay readers."
    } else {
        "Du bist ein kundiger, nüchterner Begleiter durch ${workName(uiLang, author)}. " +
            "Du erklärst klar, konkret und ohne Kitsch — für interessierte Laien."
    }

    private fun buildExplainPrompt(text: String, reference: String, uiLang: String, author: Author): String {
        val source = when {
            uiLang == "en" && author == Author.Epiktet -> "Passage from Epictetus’ “Enchiridion” ($reference):"
            uiLang == "en" && author == Author.Seneca -> "Passage from Seneca’s “On the Shortness of Life” ($reference):"
            uiLang == "en" -> "Passage from Marcus Aurelius’ “Meditations” ($reference):"
            author == Author.Epiktet -> "Passage aus Epiktets »Handbüchlein der Moral« ($reference):"
            author == Author.Seneca -> "Passage aus Senecas »Von der Kürze des Lebens« ($reference):"
            else -> "Passage aus Marc Aurels »Selbstbetrachtungen« ($reference):"
        }
        return if (uiLang == "en") {
            "$source\n\n" +
                "“$text”\n\n" +
                "Explain this passage in English in 120–180 words: first the core idea in one sentence, " +
                "then briefly the Stoic background, finally one concrete application to everyday life today. " +
                "Answer directly, without preamble and without headings."
        } else {
            "$source\n\n" +
                "»$text«\n\n" +
                "Erkläre diese Passage auf Deutsch in 120–180 Wörtern: zuerst in einem Satz den Kerngedanken, " +
                "dann kurz den stoischen Hintergrund, zuletzt eine konkrete Anwendung im heutigen Alltag. " +
                "Antworte direkt ohne Vorspann und ohne Überschriften."
        }
    }

    private fun geminiStream(text: String, reference: String, uiLang: String, author: Author): Flow<String> = flow {
        val payload = buildJsonObject {
            put("text", text)
            put("reference", reference)
            put("uiLang", uiLang)
            put(
                "author",
                when (author) {
                    Author.Epiktet -> "epiktet"
                    Author.Seneca -> "seneca"
                    Author.Aurel -> "aurel"
                },
            )
        }.toString()
        val request = Request.Builder().url(explainUrl).post(payload.toRequestBody(media)).build()
        val response = try {
            http.newCall(request).execute()
        } catch (e: IOException) {
            throw ExplainException("offline")
        }
        response.use { resp ->
            if (!resp.isSuccessful) {
                val body = runCatching { resp.body?.string().orEmpty() }.getOrDefault("")
                throw when {
                    resp.code == 429 -> ExplainException("rate_limited")
                    body.contains("GEMINI_API_KEY") -> ExplainException("not_configured")
                    else -> ExplainException("server")
                }
            }
            val source = resp.body?.source() ?: throw ExplainException("server")
            val buffer = Buffer()
            while (true) {
                val read = try {
                    source.read(buffer, 8192)
                } catch (e: IOException) {
                    throw ExplainException("offline")
                }
                if (read == -1L) break
                emit(buffer.readString(Charsets.UTF_8))
            }
        }
    }.flowOn(Dispatchers.IO)

    private fun anthropicStream(key: String, text: String, reference: String, uiLang: String, author: Author): Flow<String> = flow {
        val payload = buildJsonObject {
            put("model", "claude-opus-5")
            put("max_tokens", 1024)
            put("stream", true)
            put("system", explainSystem(uiLang, author))
            put("messages", buildJsonArray {
                add(buildJsonObject {
                    put("role", "user")
                    put("content", buildExplainPrompt(text, reference, uiLang, author))
                })
            })
        }.toString()
        val request = Request.Builder()
            .url(anthropicUrl)
            .header("x-api-key", key)
            .header("anthropic-version", "2023-06-01")
            .post(payload.toRequestBody(media))
            .build()
        val response = try {
            http.newCall(request).execute()
        } catch (e: IOException) {
            throw ExplainException("offline")
        }
        response.use { resp ->
            if (!resp.isSuccessful) {
                throw when (resp.code) {
                    401, 403 -> ExplainException("auth")
                    429 -> ExplainException("rate_limited")
                    else -> ExplainException("server")
                }
            }
            val source = resp.body?.source() ?: throw ExplainException("server")
            while (true) {
                val line = try {
                    source.readUtf8Line() ?: break
                } catch (e: IOException) {
                    throw ExplainException("offline")
                }
                if (!line.startsWith("data: ")) continue
                val data = line.removePrefix("data: ").trim()
                val element = runCatching { json.parseToJsonElement(data).jsonObject }.getOrNull() ?: continue
                if (element["type"]?.jsonPrimitive?.content != "content_block_delta") continue
                val delta = element["delta"]?.jsonObject ?: continue
                if (delta["type"]?.jsonPrimitive?.content != "text_delta") continue
                delta["text"]?.jsonPrimitive?.content?.let { emit(it) }
            }
        }
    }.flowOn(Dispatchers.IO)
}
