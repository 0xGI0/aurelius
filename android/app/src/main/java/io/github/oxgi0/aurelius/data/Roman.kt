package io.github.oxgi0.aurelius.data

private val ROMAN = listOf("", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")

fun roman(n: Int): String = ROMAN[n]

/** Parität zur Expo-App: `"Buch IV, 7"` bzw. `"Book IV, 7"`. */
fun formatReference(q: Quote, bookWord: String): String =
    "$bookWord ${roman(q.book)}, ${q.section}"

/** "Buch IV, 7" (Marc Aurel) bzw. "Handbuch, 5" (Epiktet). */
fun referenceLabel(q: Quote, bookWord: String, manualWord: String): String =
    if (authorOf(q.id) == Author.Epiktet) "$manualWord, ${q.section}" else formatReference(q, bookWord)
