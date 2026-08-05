package io.github.oxgi0.stoa.net

import io.github.oxgi0.stoa.prefs.InMemorySecretsStore
import kotlinx.coroutines.test.runTest
import okhttp3.mockwebserver.MockResponse
import okhttp3.mockwebserver.MockWebServer
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Assert.fail
import org.junit.Before
import org.junit.Test

class BackendApiTest {
    private lateinit var server: MockWebServer
    private val secrets = InMemorySecretsStore()

    @Before fun setup() { server = MockWebServer(); server.start() }
    @After fun teardown() { server.shutdown() }

    private fun api(): BackendApi =
        BackendApiFactory.create(server.url("/").toString(), secrets)

    @Test
    fun `login liefert token`() = runTest {
        server.enqueue(MockResponse().setBody("""{"key":"tok123"}"""))
        val resp = api().login(LoginBody("marc@example.com", "pw"))
        assertEquals("tok123", resp.key)
        assertEquals("/api/auth/login/", server.takeRequest().path)
    }

    @Test
    fun `interceptor setzt token-header wenn vorhanden`() = runTest {
        secrets.token = "tok123"
        server.enqueue(MockResponse().setBody("""[]"""))
        api().favorites()
        assertEquals("Token tok123", server.takeRequest().getHeader("Authorization"))
    }

    @Test
    fun `ohne token kein auth-header`() = runTest {
        server.enqueue(MockResponse().setBody("""{"key":"x"}"""))
        api().login(LoginBody("a@b.c", "pw"))
        assertEquals(null, server.takeRequest().getHeader("Authorization"))
    }

    @Test
    fun `favoriten werden geparst`() = runTest {
        server.enqueue(
            MockResponse().setBody(
                """[{"quote_id":"5-23","created_at":"2026-08-05T00:00:00Z"}]"""
            )
        )
        val favs = api().favorites()
        assertEquals(listOf("5-23"), favs.map { it.quoteId })
    }

    @Test
    fun `400 wird zu validation-fehler mit feldtext`() = runTest {
        server.enqueue(
            MockResponse().setResponseCode(400)
                .setBody("""{"email":["Enter a valid email address."]}""")
        )
        try {
            apiCall { api().login(LoginBody("kaputt", "pw")) }
            fail("erwartete ApiError.Validation")
        } catch (e: ApiError.Validation) {
            assertTrue(e.detail.contains("valid email"))
        }
    }

    @Test
    fun `401 wird zu unauthorized`() = runTest {
        server.enqueue(MockResponse().setResponseCode(401).setBody("""{"detail":"nope"}"""))
        try {
            apiCall { api().favorites() }
            fail("erwartete ApiError.Unauthorized")
        } catch (_: ApiError.Unauthorized) { }
    }
}
