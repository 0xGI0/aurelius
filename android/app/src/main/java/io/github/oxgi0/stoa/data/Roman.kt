package io.github.oxgi0.stoa.data

private val ROMAN = listOf("", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII")

fun roman(n: Int): String = ROMAN[n]

/** Parität zur Expo-App: `"Buch IV, 7"` bzw. `"Book IV, 7"`. */
fun formatReference(q: Quote, bookWord: String): String =
    "$bookWord ${roman(q.book)}, ${q.section}"

/**
 * "Buch IV, 7" (Marc Aurel), "Handbuch, 5" (Epiktet), "De brevitate 4,2"
 * (Seneca — lateinischer Titel + Kapitel,Paragraph, in beiden UI-Sprachen gleich).
 */
fun referenceLabel(q: Quote, bookWord: String, manualWord: String): String = when (authorOf(q.id)) {
    Author.Epiktet -> "$manualWord, ${q.section}"
    Author.Seneca -> "De brevitate ${q.book},${q.section}"
    Author.Aurel -> formatReference(q, bookWord)
}
