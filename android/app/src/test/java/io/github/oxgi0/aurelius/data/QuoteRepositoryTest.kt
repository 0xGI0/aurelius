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
    private val repo = QuoteRepository(
        readResource("quotes.json"),
        readResource("topics.json"),
        readResource("enchiridion.json"),
        readResource("debrevitate.json"),
    )

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

    @Test
    fun `enchiridion hat 53 kapitel in drei sprachen`() {
        assertEquals(53, repo.enchiridion.size)
        repo.enchiridion.forEach { q ->
            assertTrue(q.id.startsWith("e-"))
            listOf("de", "en", "grc").forEach { assertTrue(q.texts.getValue(it).isNotBlank()) }
        }
        assertNotNull(repo.byId("e-1"))
        assertTrue(repo.byId("e-53")!!.texts.getValue("de").contains("Zeus"))
    }

    @Test
    fun `poolFor trennt autoren und respektiert themen`() {
        assertEquals(486, repo.poolFor(Author.Aurel, null).size)
        assertEquals(53, repo.poolFor(Author.Epiktet, null).size)
        val pflichtEpiktet = repo.poolFor(Author.Epiktet, "pflicht")
        assertTrue(pflichtEpiktet.isNotEmpty())
        assertTrue(pflichtEpiktet.all { it.startsWith("e-") })
    }

    @Test
    fun `referenceLabel unterscheidet die werke`() {
        assertEquals("Handbuch, 5", referenceLabel(repo.byId("e-5")!!, "Buch", "Handbuch"))
        assertEquals("Buch IV, 7", referenceLabel(repo.byId("4-7")!!, "Buch", "Handbuch"))
        assertEquals("De brevitate, 5", referenceLabel(repo.byId("s-5")!!, "Buch", "Handbuch"))
    }

    @Test
    fun `debrevitate hat 20 kapitel mit latein im original-slot`() {
        assertEquals(20, repo.debrevitate.size)
        repo.debrevitate.forEach { q ->
            assertTrue(q.id.startsWith("s-"))
            listOf("de", "en", "grc").forEach { assertTrue(q.texts.getValue(it).isNotBlank()) }
        }
        assertTrue(repo.byId("s-1")!!.texts.getValue("grc").contains("Maior pars mortalium"))
        assertEquals(20, repo.poolFor(Author.Seneca, null).size)
    }
}
