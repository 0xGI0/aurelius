package io.github.oxgi0.aurelius.ui

import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import io.github.oxgi0.aurelius.data.QuoteRepository
import io.github.oxgi0.aurelius.data.readResource
import io.github.oxgi0.aurelius.prefs.SettingsStore
import io.github.oxgi0.aurelius.ui.screens.QuoteViewModel
import java.io.File
import kotlin.io.path.createTempDirectory
import kotlin.random.Random
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.TestScope
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test

class QuoteViewModelTest {
    private val dispatcher = UnconfinedTestDispatcher()
    private val scope = TestScope(dispatcher)
    private val repo = QuoteRepository(readResource("quotes.json"), readResource("topics.json"))

    @Before fun setup() { Dispatchers.setMain(dispatcher) }
    @After fun teardown() { Dispatchers.resetMain() }

    private fun TestScope.makeSettings(): SettingsStore {
        val dir = createTempDirectory("vm").toFile()
        return SettingsStore(
            PreferenceDataStoreFactory.create(scope = backgroundScope) {
                File(dir, "t.preferences_pb")
            }
        )
    }

    @Test
    fun `drawNext wechselt das zitat`() = scope.runTest {
        val vm = QuoteViewModel(repo, makeSettings(), Random(42))
        val first = vm.state.value.quote
        vm.drawNext()
        assertNotEquals(first.id, vm.state.value.quote.id)
    }

    @Test
    fun `selectTopic mit gleichem wert ist noop`() = scope.runTest {
        val vm = QuoteViewModel(repo, makeSettings(), Random(42))
        vm.selectTopic("tod")
        val q = vm.state.value.quote
        vm.selectTopic("tod")
        assertEquals(q.id, vm.state.value.quote.id)
    }

    @Test
    fun `selectTopic zieht nur aus dem themen-pool`() = scope.runTest {
        val vm = QuoteViewModel(repo, makeSettings(), Random(42))
        val topic = repo.topics.first { it.id == "trauer" }
        vm.selectTopic("trauer")
        repeat(10) {
            assertTrue(vm.state.value.quote.id in topic.quoteIds)
            vm.drawNext()
        }
    }

    @Test
    fun `setQuoteLang persistiert und aktualisiert state`() = scope.runTest {
        val settings = makeSettings()
        val vm = QuoteViewModel(repo, settings, Random(42))
        vm.setQuoteLang("grc")
        assertEquals("grc", settings.quoteLang.first())
        assertEquals("grc", vm.state.value.quoteLang)
    }
}
