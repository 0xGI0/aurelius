package io.github.oxgi0.stoa

import android.app.Application
import android.content.Context
import androidx.datastore.preferences.preferencesDataStore
import androidx.room.Room
import io.github.oxgi0.stoa.data.QuoteRepository
import io.github.oxgi0.stoa.db.AppDatabase
import io.github.oxgi0.stoa.net.BackendApi
import io.github.oxgi0.stoa.net.BackendApiFactory
import io.github.oxgi0.stoa.net.ExplainClient
import io.github.oxgi0.stoa.prefs.EncryptedSecretsStore
import io.github.oxgi0.stoa.prefs.SecretsStore
import io.github.oxgi0.stoa.prefs.SettingsStore
import io.github.oxgi0.stoa.sync.FavoritesRepository

private val Context.settingsDataStore by preferencesDataStore(name = "aurelius_settings")

/** Manuelle DI — bewusst ohne Hilt, damit alle Verdrahtung sichtbar bleibt. */
class AppContainer(private val app: Application) {
    val settings: SettingsStore by lazy { SettingsStore(app.settingsDataStore) }
    val secrets: SecretsStore by lazy { EncryptedSecretsStore(app) }
    val quotes: QuoteRepository by lazy {
        QuoteRepository(
            readAsset("quotes.json"),
            readAsset("topics.json"),
            readAsset("enchiridion.json"),
            readAsset("debrevitate.json"),
        )
    }
    val db: AppDatabase by lazy {
        Room.databaseBuilder(app, AppDatabase::class.java, "aurelius.db").build()
    }
    val favorites: FavoritesRepository by lazy {
        FavoritesRepository(
            dao = db.favoriteDao(),
            session = { if (secrets.token != null) api else null },
            onUnauthorized = { secrets.token = null; secrets.email = null },
        )
    }
    val api: BackendApi by lazy {
        BackendApiFactory.create(BuildConfig.BACKEND_URL.ifBlank { "http://unkonfiguriert.invalid" }, secrets)
    }
    val explain: ExplainClient by lazy { ExplainClient(BuildConfig.EXPLAIN_URL) }

    private fun readAsset(name: String): String =
        app.assets.open(name).bufferedReader().use { it.readText() }
}

class AureliusApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
