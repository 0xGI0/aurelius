package io.github.oxgi0.aurelius.ui.screens

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import io.github.oxgi0.aurelius.data.Author
import io.github.oxgi0.aurelius.data.Quote
import io.github.oxgi0.aurelius.data.QuoteRepository
import io.github.oxgi0.aurelius.data.ShuffleBag
import io.github.oxgi0.aurelius.prefs.SettingsStore
import kotlin.random.Random
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class QuoteUiState(
    val quote: Quote,
    val topicId: String?,
    val quoteLang: String,
    val author: Author = Author.Aurel,
)

class QuoteViewModel(
    private val repo: QuoteRepository,
    private val settings: SettingsStore,
    rng: Random = Random.Default,
) : ViewModel() {
    private val rng = rng
    private var bag = ShuffleBag(repo.poolFor(Author.Aurel, null), rng)

    private val _state = MutableStateFlow(
        QuoteUiState(quote = checkNotNull(repo.byId(bag.next())), topicId = null, quoteLang = "de")
    )
    val state: StateFlow<QuoteUiState> = _state

    init {
        viewModelScope.launch {
            // Autor dauerhaft beobachten — Wechsel auf anderen Tabs greifen sofort
            settings.author.collect { saved ->
                val author = if (saved == "epiktet") Author.Epiktet else Author.Aurel
                if (author != _state.value.author) applyAuthor(author)
            }
        }
        viewModelScope.launch {
            settings.quoteLang.collect { lang -> _state.update { it.copy(quoteLang = lang) } }
        }
    }

    private fun applyAuthor(author: Author) {
        bag = ShuffleBag(repo.poolFor(author, _state.value.topicId), rng)
        _state.update { it.copy(author = author, quote = checkNotNull(repo.byId(bag.next()))) }
    }

    fun selectAuthor(author: Author) {
        if (author == _state.value.author) return
        // Persistieren genügt — der author-Collector im init wendet den Wechsel an
        viewModelScope.launch {
            settings.setAuthor(if (author == Author.Epiktet) "epiktet" else "aurel")
        }
    }

    fun drawNext() {
        _state.update { it.copy(quote = checkNotNull(repo.byId(bag.next()))) }
    }

    /** Parität: gleiches Thema erneut → No-Op; sonst neuer Bag + Sofort-Swap. */
    fun selectTopic(id: String?) {
        if (id == _state.value.topicId) return
        bag = ShuffleBag(repo.poolFor(_state.value.author, id), rng)
        _state.update { it.copy(topicId = id, quote = checkNotNull(repo.byId(bag.next()))) }
    }

    fun setQuoteLang(lang: String) {
        _state.update { it.copy(quoteLang = lang) }
        viewModelScope.launch { settings.setQuoteLang(lang) }
    }
}
