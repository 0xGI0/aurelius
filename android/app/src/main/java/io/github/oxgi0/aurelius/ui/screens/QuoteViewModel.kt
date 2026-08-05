package io.github.oxgi0.aurelius.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.oxgi0.aurelius.data.Quote
import io.github.oxgi0.aurelius.data.QuoteRepository
import io.github.oxgi0.aurelius.data.ShuffleBag
import io.github.oxgi0.aurelius.prefs.SettingsStore
import kotlin.random.Random
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class QuoteUiState(
    val quote: Quote,
    val topicId: String?,
    val quoteLang: String,
)

class QuoteViewModel(
    private val repo: QuoteRepository,
    private val settings: SettingsStore,
    rng: Random = Random.Default,
) : ViewModel() {
    private val rng = rng
    private val allIds = repo.quotes.map { it.id }
    private var bag = ShuffleBag(allIds, rng)

    private val _state = MutableStateFlow(
        QuoteUiState(quote = checkNotNull(repo.byId(bag.next())), topicId = null, quoteLang = "de")
    )
    val state: StateFlow<QuoteUiState> = _state

    init {
        viewModelScope.launch {
            settings.quoteLang.collect { lang -> _state.update { it.copy(quoteLang = lang) } }
        }
    }

    fun drawNext() {
        _state.update { it.copy(quote = checkNotNull(repo.byId(bag.next()))) }
    }

    /** Parität: gleiches Thema erneut → No-Op; sonst neuer Bag + Sofort-Swap. */
    fun selectTopic(id: String?) {
        if (id == _state.value.topicId) return
        val pool = if (id == null) allIds else repo.topics.first { it.id == id }.quoteIds
        bag = ShuffleBag(pool, rng)
        _state.update { it.copy(topicId = id, quote = checkNotNull(repo.byId(bag.next()))) }
    }

    fun setQuoteLang(lang: String) {
        _state.update { it.copy(quoteLang = lang) }
        viewModelScope.launch { settings.setQuoteLang(lang) }
    }
}
