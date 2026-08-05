package io.github.oxgi0.aurelius.data

import org.junit.Assert.assertEquals
import org.junit.Test

class RomanTest {
    @Test
    fun `roemische zahlen 1 bis 12`() {
        assertEquals("I", roman(1))
        assertEquals("IV", roman(4))
        assertEquals("XII", roman(12))
    }

    @Test
    fun `referenz formatierung`() {
        val q = Quote("4-7", 4, 7, mapOf("de" to "x", "en" to "x", "grc" to "x"))
        assertEquals("Buch IV, 7", formatReference(q, "Buch"))
        assertEquals("Book IV, 7", formatReference(q, "Book"))
    }
}
