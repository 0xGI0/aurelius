package io.github.oxgi0.aurelius.data

import kotlinx.serialization.json.Json

class QuoteRepository(quotesJson: String, topicsJson: String, enchiridionJson: String = "[]") {
    private val json = Json { ignoreUnknownKeys = true }

    val quotes: List<Quote> = json.decodeFromString(quotesJson)
    val topics: List<Topic> = json.decodeFromString(topicsJson)

    /** Epiktets Encheiridion in Quote-Form: book 0, section = Kapitel. */
    val enchiridion: List<Quote> =
        json.decodeFromString<List<EnchEntry>>(enchiridionJson)
            .map { Quote(id = it.id, book = 0, section = it.chapter, texts = it.texts) }

    private val index: Map<String, Quote> = (quotes + enchiridion).associateBy { it.id }

    fun byId(id: String): Quote? = index[id]

    fun byBook(book: Int): List<Quote> =
        quotes.filter { it.book == book }.sortedBy { it.section }

    /** Buchnummer → Abschnittszahl, nach Buchnummer sortiert. */
    fun books(): List<Pair<Int, Int>> =
        quotes.groupBy { it.book }.map { (book, list) -> book to list.size }.sortedBy { it.first }

    fun quotesFor(author: Author): List<Quote> =
        if (author == Author.Epiktet) enchiridion else quotes

    /** Zieh-Pool für Autor × Thema (null = alle). */
    fun poolFor(author: Author, topicId: String?): List<String> {
        val base = if (topicId == null) {
            quotesFor(author).map { it.id }
        } else {
            topics.firstOrNull { it.id == topicId }?.quoteIds ?: quotesFor(author).map { it.id }
        }
        return base.filter { authorOf(it) == author }
    }
}
