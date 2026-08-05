package io.github.oxgi0.aurelius.data

import kotlinx.serialization.json.Json

class QuoteRepository(quotesJson: String, topicsJson: String) {
    private val json = Json { ignoreUnknownKeys = true }

    val quotes: List<Quote> = json.decodeFromString(quotesJson)
    val topics: List<Topic> = json.decodeFromString(topicsJson)

    private val index: Map<String, Quote> = quotes.associateBy { it.id }

    fun byId(id: String): Quote? = index[id]

    fun byBook(book: Int): List<Quote> =
        quotes.filter { it.book == book }.sortedBy { it.section }

    /** Buchnummer → Abschnittszahl, nach Buchnummer sortiert. */
    fun books(): List<Pair<Int, Int>> =
        quotes.groupBy { it.book }.map { (book, list) -> book to list.size }.sortedBy { it.first }
}
