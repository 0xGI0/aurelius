package io.github.oxgi0.aurelius.sync

import io.github.oxgi0.aurelius.db.FavoriteDao
import io.github.oxgi0.aurelius.db.FavoriteEntity
import io.github.oxgi0.aurelius.net.BackendApi
import java.time.OffsetDateTime
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Lokal-first-Favoriten (Parität zu lib/settings.ts der Expo-App:
 * Einfüge-Reihenfolge, Toggle). Der Backend-Sync kommt in Task 9 dazu.
 */
class FavoritesRepository(
    private val dao: FavoriteDao,
    private val now: () -> Long = System::currentTimeMillis,
) {
    val favorites: Flow<List<String>> = dao.favorites().map { list -> list.map { it.quoteId } }

    /** @return neuer Zustand: true = ist jetzt Favorit */
    suspend fun toggle(quoteId: String): Boolean {
        val exists = dao.all().any { it.quoteId == quoteId }
        if (exists) dao.delete(quoteId) else dao.insert(FavoriteEntity(quoteId, now()))
        return !exists
    }

    suspend fun isFavorite(quoteId: String): Boolean =
        dao.all().any { it.quoteId == quoteId }

    /**
     * Merge beim Login (Spec §6): erst alle lokalen Favoriten hochladen
     * (PUT ist idempotent), dann die Server-Gesamtliste übernehmen —
     * Vereinigung, nichts geht verloren.
     */
    suspend fun onLogin(api: BackendApi) {
        dao.all().forEach { runCatching { api.putFavorite(it.quoteId) } }
        val remote = api.favorites()
        dao.replaceAll(
            remote.mapIndexed { i, dto ->
                FavoriteEntity(dto.quoteId, parseCreatedAt(dto.createdAt, fallbackOrder = i.toLong()))
            }
        )
    }

    private fun parseCreatedAt(iso: String, fallbackOrder: Long): Long =
        runCatching { OffsetDateTime.parse(iso).toInstant().toEpochMilli() }
            .getOrDefault(fallbackOrder)
}
