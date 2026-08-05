package io.github.oxgi0.stoa.sync

import io.github.oxgi0.stoa.db.FavoriteDao
import io.github.oxgi0.stoa.db.FavoriteEntity
import io.github.oxgi0.stoa.db.PendingOpEntity
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Test

/** In-Memory-DAO für reine JVM-Tests. */
class FakeFavoriteDao : FavoriteDao {
    private val favs = MutableStateFlow<List<FavoriteEntity>>(emptyList())
    private val queue = mutableListOf<PendingOpEntity>()
    private var nextId = 1L

    override fun favorites(): Flow<List<FavoriteEntity>> = favs.map { it.sortedBy { f -> f.createdAt } }
    override suspend fun all(): List<FavoriteEntity> = favs.value
    override suspend fun insert(favorite: FavoriteEntity) {
        if (favs.value.none { it.quoteId == favorite.quoteId }) favs.value += favorite
    }
    override suspend fun delete(quoteId: String) {
        favs.value = favs.value.filterNot { it.quoteId == quoteId }
    }
    override suspend fun replaceAll(favorites: List<FavoriteEntity>) {
        favs.value = favorites
    }
    override suspend fun clearFavorites() { favs.value = emptyList() }
    override suspend fun enqueue(op: PendingOpEntity) { queue += op.copy(id = nextId++) }
    override suspend fun pendingOps(): List<PendingOpEntity> = queue.toList()
    override suspend fun dequeue(id: Long) { queue.removeAll { it.id == id } }
}

class FavoritesRepositoryTest {
    @Test
    fun `toggle fuegt hinzu und entfernt`() = runTest {
        val repo = FavoritesRepository(FakeFavoriteDao(), now = { 1L })
        assertTrue(repo.toggle("5-23"))
        assertEquals(listOf("5-23"), repo.favorites.first())
        assertFalse(repo.toggle("5-23"))
        assertEquals(emptyList<String>(), repo.favorites.first())
    }

    @Test
    fun `reihenfolge ist einfuege-reihenfolge`() = runTest {
        var t = 0L
        val repo = FavoritesRepository(FakeFavoriteDao(), now = { ++t })
        repo.toggle("4-7"); repo.toggle("2-1"); repo.toggle("12-19")
        assertEquals(listOf("4-7", "2-1", "12-19"), repo.favorites.first())
    }

    @Test
    fun `isFavorite spiegelt zustand`() = runTest {
        val repo = FavoritesRepository(FakeFavoriteDao(), now = { 1L })
        assertFalse(repo.isFavorite("4-7"))
        repo.toggle("4-7")
        assertTrue(repo.isFavorite("4-7"))
    }
}
