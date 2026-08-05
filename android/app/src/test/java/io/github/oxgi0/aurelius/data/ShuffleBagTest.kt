package io.github.oxgi0.aurelius.data

import kotlin.random.Random
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotEquals
import org.junit.Test

class ShuffleBagTest {
    @Test
    fun `zieht jede id genau einmal pro runde`() {
        val ids = listOf("a", "b", "c", "d")
        val bag = ShuffleBag(ids, Random(42))
        assertEquals(ids.toSet(), (1..4).map { bag.next() }.toSet())
    }

    @Test
    fun `keine wiederholung ueber rundengrenze`() {
        // Innerhalb einer Runde ist jede ID einmalig; der Rundengrenzen-Guard
        // verhindert Wiederholungen dazwischen → alle aufeinanderfolgenden
        // Ziehungen müssen verschieden sein.
        val bag = ShuffleBag(listOf("a", "b", "c"), Random(7))
        var prev = bag.next()
        repeat(60) {
            val cur = bag.next()
            assertNotEquals(prev, cur)
            prev = cur
        }
    }

    @Test
    fun `einzelnes element wiederholt sich zwangslaeufig`() {
        val bag = ShuffleBag(listOf("solo"), Random(1))
        assertEquals("solo", bag.next())
        assertEquals("solo", bag.next())
    }
}
