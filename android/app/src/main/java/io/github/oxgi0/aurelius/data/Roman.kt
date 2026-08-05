package io.github.oxgi0.aurelius.data

private val ROMAN = listOf("", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")

fun roman(n: Int): String = ROMAN[n]

/** Parität zur Expo-App: `"Buch IV, 7"` bzw. `"Book IV, 7"`. */
fun formatReference(q: Quote, bookWord: String): String =
    "$bookWord ${roman(q.book)}, ${q.section}"
