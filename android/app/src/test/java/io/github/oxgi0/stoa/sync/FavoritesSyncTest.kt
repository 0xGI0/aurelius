package io.github.oxgi0.stoa.sync

import io.github.oxgi0.stoa.net.BackendApi
import io.github.oxgi0.stoa.net.DetailResponse
import io.github.oxgi0.stoa.net.FavoriteDto
import io.github.oxgi0.stoa.net.KeyBody
import io.github.oxgi0.stoa.net.LoginBody
import io.github.oxgi0.stoa.net.EmailBody
import io.github.oxgi0.stoa.net.RegisterBody
import io.github.oxgi0.stoa.net.TokenResponse
import java.io.IOException
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.runTest
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.ResponseBody.Companion.toResponseBody
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test
import retrofit2.HttpException
import retrofit2.Response

/**
 * Fake-Backend: mode steuert das Verhalten ("ok" | "offline" | "401"),
 * puts/deletes protokollieren die Aufrufe, serverFavs ist der Server-Zustand.
 */
class FakeApi(var mode: String = "ok") : BackendApi {
    val puts = mutableListOf<String>()
    val deletes = mutableListOf<String>()
    val serverFavs = mutableListOf<String>()

    private fun gate() {
        when (mode) {
            "offline" -> throw IOException("offline")
            "401" -> throw HttpException(
                Response.error<Unit>(401, """{"detail":"nope"}""".toResponseBody("application/json".toMediaType()))
            )
        }
    }

    override suspend fun putFavorite(id: String): FavoriteDto {
        gate(); puts += id
        if (id !in serverFavs) serverFavs += id
        return FavoriteDto(id, "2026-08-05T00:00:0${serverFavs.size}+00:00")
    }

    override suspend fun deleteFavorite(id: String): Response<Unit> {
        gate(); deletes += id; serverFavs -= id
        return Response.success(Unit)
    }

    override suspend fun favorites(): List<FavoriteDto> {
        gate()
        return serverFavs.mapIndexed { i, id -> FavoriteDto(id, "2026-08-05T00:00:0$i+00:00") }
    }

    override suspend fun register(body: RegisterBody) = DetailResponse("ok")
    override suspend fun verifyEmail(body: KeyBody) = DetailResponse("ok")
    override suspend fun login(body: LoginBody) = TokenResponse("tok")
    override suspend fun logout() = DetailResponse("ok")
    override suspend fun passwordReset(body: EmailBody) = DetailResponse("ok")
}

class FavoritesSyncTest {
    private fun repo(dao: FakeFavoriteDao, api: FakeApi?, onUnauthorized: () -> Unit = {}): FavoritesRepository {
        var t = 0L
        return FavoritesRepository(dao, session = { api }, onUnauthorized = onUnauthorized, now = { ++t })
    }

    @Test
    fun `onLogin vereinigt lokal und server`() = runTest {
        val dao = FakeFavoriteDao()
        val api = FakeApi().apply { serverFavs += "9-1" }
        val r = repo(dao, api)
        r.toggle("4-7"); r.toggle("2-1")
        r.onLogin(api)
        assertEquals(setOf("4-7", "2-1", "9-1"), r.favorites.first().toSet())
        assertTrue(api.puts.containsAll(listOf("4-7", "2-1")))
    }

    @Test
    fun `toggle online synct sofort`() = runTest {
        val dao = FakeFavoriteDao()
        val api = FakeApi()
        val r = repo(dao, api)
        r.toggle("5-23")
        assertEquals(listOf("5-23"), api.puts)
        r.toggle("5-23")
        assertEquals(listOf("5-23"), api.deletes)
        assertEquals(0, dao.pendingOps().size)
    }

    @Test
    fun `toggle offline landet in der queue`() = runTest {
        val dao = FakeFavoriteDao()
        val api = FakeApi(mode = "offline")
        val r = repo(dao, api)
        r.toggle("5-23")
        assertEquals(listOf("5-23"), r.favorites.first()) // lokal trotzdem da
        assertEquals(1, dao.pendingOps().size)
        assertEquals("add", dao.pendingOps().first().op)
    }

    @Test
    fun `flushQueue arbeitet ab und leert`() = runTest {
        val dao = FakeFavoriteDao()
        val api = FakeApi(mode = "offline")
        val r = repo(dao, api)
        r.toggle("5-23"); r.toggle("4-7")
        assertEquals(2, dao.pendingOps().size)
        api.mode = "ok"
        r.flushQueue()
        assertEquals(0, dao.pendingOps().size)
        assertEquals(setOf("5-23", "4-7"), api.serverFavs.toSet())
    }

    @Test
    fun `401 loescht session behaelt lokale daten`() = runTest {
        val dao = FakeFavoriteDao()
        var loggedOut = false
        val api = FakeApi(mode = "401")
        val r = repo(dao, api) { loggedOut = true }
        r.toggle("5-23")
        assertTrue(loggedOut)
        assertEquals(listOf("5-23"), r.favorites.first())
        assertEquals(0, dao.pendingOps().size) // 401 wird nicht wiederholt
    }

    @Test
    fun `ohne session bleibt alles lokal`() = runTest {
        val dao = FakeFavoriteDao()
        val r = repo(dao, null)
        r.toggle("5-23")
        assertEquals(listOf("5-23"), r.favorites.first())
        assertEquals(0, dao.pendingOps().size)
    }
}
