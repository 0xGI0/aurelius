package io.github.oxgi0.aurelius.net

import io.github.oxgi0.aurelius.data.Quote
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test

class ExplainClientTest {
    private lateinit var server: MockWebServer
    private val quote = Quote("4-7", 4, 7, mapOf("de" to "Nimm die Meinung weg.", "en" to "Take away the opinion.", "grc" to "x"))

    @Before fun setup() { server = MockWebServer(); server.start() }
    @After fun teardown() { server.shutdown() }

    private fun client() = ExplainClient(
        explainUrl = server.url("/api/explain").toString(),
        anthropicUrl = server.url("/v1/messages").toString(),
    )

    @Test
    fun `gratis-modus streamt text`() = runTest {
        server.enqueue(MockResponse().setBody("Der Kerngedanke ist Gelassenheit."))
        val chunks = client().explainStream(quote, "de", "de", anthropicKey = null).toList()
        assertEquals("Der Kerngedanke ist Gelassenheit.", chunks.joinToString(""))
        val req = server.takeRequest()
        assertEquals("/api/explain", req.path)
        assertTrue(req.body.readUtf8().contains("\"reference\":\"Buch IV, 7\""))
    }

    @Test
    fun `429 wird zu rate_limited`() = runTest {
        server.enqueue(MockResponse().setResponseCode(429).setBody("""{"error":"Kontingent erschöpft"}"""))
        try {
            client().explainStream(quote, "de", "de", null).toList()
            fail("erwartete ExplainException")
        } catch (e: ExplainException) {
            assertEquals("rate_limited", e.kind)
        }
    }

    @Test
    fun `fehlender server-key wird zu not_configured`() = runTest {
        server.enqueue(MockResponse().setResponseCode(500).setBody("""{"error":"GEMINI_API_KEY fehlt"}"""))
        try {
            client().explainStream(quote, "de", "de", null).toList()
            fail("erwartete ExplainException")
        } catch (e: ExplainException) {
            assertEquals("not_configured", e.kind)
        }
    }

    @Test
    fun `netzfehler wird zu offline`() = runTest {
        server.shutdown()
        try {
            client().explainStream(quote, "de", "de", null).toList()
            fail("erwartete ExplainException")
        } catch (e: ExplainException) {
            assertEquals("offline", e.kind)
        }
    }

    @Test
    fun `byok nutzt anthropic-sse und parst text-deltas`() = runTest {
        val sse = """
            event: content_block_delta
            data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"Nimm "}}

            event: content_block_delta
            data: {"type":"content_block_delta","index":0,"delta":{"type":"text_delta","text":"wahr."}}

            event: message_stop
            data: {"type":"message_stop"}

        """.trimIndent()
        server.enqueue(MockResponse().setBody(sse))
        val chunks = client().explainStream(quote, "de", "de", anthropicKey = "sk-ant-test").toList()
        assertEquals("Nimm wahr.", chunks.joinToString(""))
        val req = server.takeRequest()
        assertEquals("/v1/messages", req.path)
        assertEquals("sk-ant-test", req.getHeader("x-api-key"))
    }

    @Test
    fun `anthropic 401 wird zu auth`() = runTest {
        server.enqueue(MockResponse().setResponseCode(401).setBody("""{"type":"error"}"""))
        try {
            client().explainStream(quote, "de", "de", "sk-ant-falsch").toList()
            fail("erwartete ExplainException")
        } catch (e: ExplainException) {
            assertEquals("auth", e.kind)
        }
    }
}
