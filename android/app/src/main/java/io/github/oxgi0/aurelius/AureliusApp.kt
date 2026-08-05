package io.github.oxgi0.aurelius

import android.app.Application
import android.content.Context
import androidx.datastore.preferences.preferencesDataStore
import io.github.oxgi0.aurelius.data.QuoteRepository
import io.github.oxgi0.aurelius.prefs.EncryptedSecretsStore
import io.github.oxgi0.aurelius.prefs.SecretsStore
import io.github.oxgi0.aurelius.prefs.SettingsStore

private val Context.settingsDataStore by preferencesDataStore(name = "aurelius_settings")

/** Manuelle DI — bewusst ohne Hilt, damit alle Verdrahtung sichtbar bleibt. */
class AppContainer(private val app: Application) {
    val settings: SettingsStore by lazy { SettingsStore(app.settingsDataStore) }
    val secrets: SecretsStore by lazy { EncryptedSecretsStore(app) }
    val quotes: QuoteRepository by lazy {
        QuoteRepository(readAsset("quotes.json"), readAsset("topics.json"))
    }

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
