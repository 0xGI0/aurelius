package io.github.oxgi0.aurelius.db

import androidx.room.Dao
import androidx.room.Database
import androidx.room.Entity
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.PrimaryKey
import androidx.room.Query
import androidx.room.RoomDatabase
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "favorites")
data class FavoriteEntity(
    @PrimaryKey val quoteId: String,
    val createdAt: Long,
)

/** Offline-Warteschlange für Sync-Operationen (Task 9). */
@Entity(tableName = "pending_ops")
data class PendingOpEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val quoteId: String,
    val op: String, // "add" | "remove"
    val queuedAt: Long,
)

@Dao
interface FavoriteDao {
    @Query("SELECT * FROM favorites ORDER BY createdAt ASC")
    fun favorites(): Flow<List<FavoriteEntity>>

    @Query("SELECT * FROM favorites")
    suspend fun all(): List<FavoriteEntity>

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insert(favorite: FavoriteEntity)

    @Query("DELETE FROM favorites WHERE quoteId = :quoteId")
    suspend fun delete(quoteId: String)

    @Transaction
    suspend fun replaceAll(favorites: List<FavoriteEntity>) {
        clearFavorites()
        favorites.forEach { insert(it) }
    }

    @Query("DELETE FROM favorites")
    suspend fun clearFavorites()

    @Insert
    suspend fun enqueue(op: PendingOpEntity)

    @Query("SELECT * FROM pending_ops ORDER BY id ASC")
    suspend fun pendingOps(): List<PendingOpEntity>

    @Query("DELETE FROM pending_ops WHERE id = :id")
    suspend fun dequeue(id: Long)
}

@Database(entities = [FavoriteEntity::class, PendingOpEntity::class], version = 1, exportSchema = true)
abstract class AppDatabase : RoomDatabase() {
    abstract fun favoriteDao(): FavoriteDao
}
