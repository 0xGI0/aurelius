package io.github.oxgi0.stoa.data

import kotlinx.serialization.json.Json

class QuoteRepository(
    quotesJson: String,
    topicsJson: String,
    enchiridionJson: String = "[]",
    debrevitateJson: String = "[]",
) {
    private val json = Json { ignoreUnknownKeys = true }

    val quotes: List<Quote> = json.decodeFromString(quotesJson)
    val topics: List<Topic> = json.decodeFromString(topicsJson)

    private fun chapters(raw: String): List<Quote> =
        json.decodeFromString<List<EnchEntry>>(raw)
            .map { Quote(id = it.id, book = 0, section = it.chapter, texts = it.texts) }

    /** Epiktets Encheiridion in Quote-Form: book 0, section = Kapitel. */
    val enchiridion: List<Quote> = chapters(enchiridionJson)

    /** Senecas De brevitate vitae — der 'grc'-Slot trägt hier das LATEINISCHE Original. */
    val debrevitate: List<Quote> = chapters(debrevitateJson)

    private val index: Map<String, Quote> =
        (quotes + enchiridion + debrevitate).associateBy { it.id }

    fun byId(id: String): Quote? = index[id]

    fun byBook(book: Int): List<Quote> =
        quotes.filter { it.book == book }.sortedBy { it.section }

    /** Buchnummer → Abschnittszahl, nach Buchnummer sortiert. */
    fun books(): List<Pair<Int, Int>> =
        quotes.groupBy { it.book }.map { (book, list) -> book to list.size }.sortedBy { it.first }

    fun quotesFor(author: Author): List<Quote> = when (author) {
        Author.Epiktet -> enchiridion
        Author.Seneca -> debrevitate
        Author.Aurel -> quotes
    }

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
