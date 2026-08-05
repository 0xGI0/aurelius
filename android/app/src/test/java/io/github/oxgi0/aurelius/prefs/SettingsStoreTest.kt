package io.github.oxgi0.aurelius.prefs

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.edit
import java.io.File
import kotlin.io.path.createTempDirectory
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Test

class SettingsStoreTest {
    private val scope = TestScope(UnconfinedTestDispatcher())

    private fun TestScope.makeStore(): SettingsStore {
        val dir = createTempDirectory("settings").toFile()
        val dataStore = PreferenceDataStoreFactory.create(scope = backgroundScope) {
            File(dir, "test.preferences_pb")
        }
        return SettingsStore(dataStore)
    }

    @Test
    fun `defaults sind de de system`() = scope.runTest {
        val store = makeStore()
        assertEquals("de", store.uiLang.first())
        assertEquals("de", store.quoteLang.first())
        assertEquals("system", store.themePref.first())
    }

    @Test
    fun `roundtrip persistiert werte`() = scope.runTest {
        val store = makeStore()
        store.setUiLang("en")
        store.setQuoteLang("grc")
        store.setThemePref("dark")
        assertEquals("en", store.uiLang.first())
        assertEquals("grc", store.quoteLang.first())
        assertEquals("dark", store.themePref.first())
    }

    @Test
    fun `ungueltige werte fallen auf default`() = scope.runTest {
        val store = makeStore()
        // Direkt korrupten Wert schreiben (Parität: Expo validiert beim Lesen)
        store.dataStore.edit { it[SettingsStore.UI_LANG] = "fr" }
        store.dataStore.edit { it[SettingsStore.QUOTE_LANG] = "xx" }
        store.dataStore.edit { it[SettingsStore.THEME] = "neon" }
        assertEquals("de", store.uiLang.first())
        assertEquals("de", store.quoteLang.first())
        assertEquals("system", store.themePref.first())
    }

    @Test
    fun `setter validieren ebenfalls`() = scope.runTest {
        val store = makeStore()
        store.setUiLang("fr") // wird ignoriert
        assertEquals("de", store.uiLang.first())
    }
}
