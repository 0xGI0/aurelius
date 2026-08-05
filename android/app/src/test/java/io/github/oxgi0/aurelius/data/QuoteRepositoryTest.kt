package io.github.oxgi0.aurelius.data

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

internal fun readResource(name: String): String =
    checkNotNull(QuoteRepositoryTest::class.java.classLoader?.getResource(name)) {
        "Test-Ressource $name fehlt"
    }.readText()

class QuoteRepositoryTest {
    private val repo = QuoteRepository(readResource("quotes.json"), readResource("topics.json"))

    @Test
    fun `laedt alle 486 zitate mit drei sprachen`() {
        assertEquals(486, repo.quotes.size)
        repo.quotes.forEach { q ->
            assertEquals(q.id, "${q.book}-${q.section}")
            listOf("de", "en", "grc").forEach { assertTrue(q.texts.getValue(it).isNotBlank()) }
        }
    }

    @Test
    fun `buch 12 hat luecke bei 18`() {
        assertNull(repo.byId("12-18"))
        assertNotNull(repo.byId("12-19"))
        assertEquals(35, repo.byBook(12).size)
    }

    @Test
    fun `neun topics in fester reihenfolge`() {
        assertEquals(
            listOf("tod", "wut", "trauer", "angst", "familie", "besitz", "gelassenheit", "pflicht", "natur"),
            repo.topics.map { it.id }
        )
    }

    @Test
    fun `books liefert 12 buecher mit abschnittszahlen`() {
        val books = repo.books()
        assertEquals(12, books.size)
        assertEquals(4 to 51, books[3])
        assertEquals(12 to 35, books[11])
    }
}
