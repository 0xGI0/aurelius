package io.github.oxgi0.aurelius.sync

import io.github.oxgi0.aurelius.db.FavoriteDao
import io.github.oxgi0.aurelius.db.FavoriteEntity
import io.github.oxgi0.aurelius.db.PendingOpEntity
import io.github.oxgi0.aurelius.net.ApiError
import io.github.oxgi0.aurelius.net.BackendApi
import io.github.oxgi0.aurelius.net.apiCall
import java.time.OffsetDateTime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Lokal-first-Favoriten mit optionalem Backend-Sync (Spec §6):
 * - ohne Konto rein lokal (session() == null)
 * - mit Konto: optimistisch lokal, dann API; Netzfehler → Offline-Queue
 * - 401 → Session beenden (onUnauthorized), lokale Daten bleiben
 */
class FavoritesRepository(
    private val dao: FavoriteDao,
    private val session: () -> BackendApi? = { null },
    private val onUnauthorized: () -> Unit = {},
    private val now: () -> Long = System::currentTimeMillis,
) {
    val favorites: Flow<List<String>> = dao.favorites().map { list -> list.map { it.quoteId } }

    /** @return neuer Zustand: true = ist jetzt Favorit */
    suspend fun toggle(quoteId: String): Boolean {
        val exists = dao.all().any { it.quoteId == quoteId }
        if (exists) dao.delete(quoteId) else dao.insert(FavoriteEntity(quoteId, now()))
        val isFav = !exists

        val api = session()
        if (api != null) {
            try {
                if (isFav) apiCall { api.putFavorite(quoteId) }
                else apiCall { api.deleteFavorite(quoteId) }
            } catch (e: ApiError.Unauthorized) {
                onUnauthorized()
            } catch (e: ApiError) {
                // Offline/Server/RateLimited: später nachholen
                dao.enqueue(PendingOpEntity(quoteId = quoteId, op = if (isFav) "add" else "remove", queuedAt = now()))
            }
        }
        return isFav
    }

    suspend fun isFavorite(quoteId: String): Boolean =
        dao.all().any { it.quoteId == quoteId }

    /**
     * Merge beim Login: erst alle lokalen Favoriten hochladen (PUT ist
     * idempotent), dann die Server-Gesamtliste übernehmen — Vereinigung,
     * nichts geht verloren. Danach evtl. Queue-Reste nachholen.
     */
    suspend fun onLogin(api: BackendApi) {
        dao.all().forEach { runCatching { apiCall { api.putFavorite(it.quoteId) } } }
        val remote = apiCall { api.favorites() }
        dao.replaceAll(
            remote.mapIndexed { i, dto ->
                FavoriteEntity(dto.quoteId, parseCreatedAt(dto.createdAt, fallbackOrder = i.toLong()))
            }
        )
        flushQueue()
    }

    /** Offline-Queue abarbeiten; bei Fehlern bleibt der Rest für den nächsten Versuch. */
    suspend fun flushQueue() {
        val api = session() ?: return
        for (op in dao.pendingOps()) {
            try {
                if (op.op == "add") apiCall { api.putFavorite(op.quoteId) }
                else apiCall { api.deleteFavorite(op.quoteId) }
                dao.dequeue(op.id)
            } catch (e: ApiError.Unauthorized) {
                onUnauthorized()
                dao.dequeue(op.id)
                return
            } catch (e: ApiError) {
                return
            }
        }
    }

    private fun parseCreatedAt(iso: String, fallbackOrder: Long): Long =
        runCatching { OffsetDateTime.parse(iso).toInstant().toEpochMilli() }
            .getOrDefault(fallbackOrder)
}
