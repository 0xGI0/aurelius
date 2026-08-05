package io.github.oxgi0.aurelius.sync

import io.github.oxgi0.aurelius.db.FavoriteDao
import io.github.oxgi0.aurelius.db.FavoriteEntity
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
}
