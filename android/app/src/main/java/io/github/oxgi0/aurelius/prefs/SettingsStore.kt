package io.github.oxgi0.aurelius.prefs

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

/**
 * Persistierte Einstellungen — Keys und Validierung in Parität zur Expo-App
 * (lib/settings.ts, lib/i18n.ts): ungültige Werte fallen still auf den Default.
 */
class SettingsStore(internal val dataStore: DataStore<Preferences>) {

    companion object {
        val UI_LANG = stringPreferencesKey("aurelius.uiLang")
        val QUOTE_LANG = stringPreferencesKey("aurelius.quoteLang")
        val THEME = stringPreferencesKey("aurelius.theme")
        val AUTHOR = stringPreferencesKey("aurelius.author")

        private val UI_LANGS = setOf("de", "en")
        private val QUOTE_LANGS = setOf("de", "en", "grc")
        private val THEMES = setOf("light", "dark", "system")
        private val AUTHORS = setOf("aurel", "epiktet", "seneca")
    }

    val uiLang: Flow<String> =
        dataStore.data.map { p -> p[UI_LANG].takeIf { it in UI_LANGS } ?: "de" }

    val quoteLang: Flow<String> =
        dataStore.data.map { p -> p[QUOTE_LANG].takeIf { it in QUOTE_LANGS } ?: "de" }

    val themePref: Flow<String> =
        dataStore.data.map { p -> p[THEME].takeIf { it in THEMES } ?: "system" }

    suspend fun setUiLang(v: String) {
        if (v in UI_LANGS) dataStore.edit { it[UI_LANG] = v }
    }

    suspend fun setQuoteLang(v: String) {
        if (v in QUOTE_LANGS) dataStore.edit { it[QUOTE_LANG] = v }
    }

    suspend fun setThemePref(v: String) {
        if (v in THEMES) dataStore.edit { it[THEME] = v }
    }

    val author: Flow<String> =
        dataStore.data.map { p -> p[AUTHOR].takeIf { it in AUTHORS } ?: "aurel" }

    suspend fun setAuthor(v: String) {
        if (v in AUTHORS) dataStore.edit { it[AUTHOR] = v }
    }
}
