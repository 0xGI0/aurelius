package io.github.oxgi0.stoa.data

import kotlin.random.Random

/**
 * Port der ShuffleBag aus der Expo-App (lib/quotes.ts): Fisher-Yates-Mischung,
 * Ziehen vom Ende, und an der Rundengrenze wird das zuletzt gezogene Element
 * nie direkt wiederholt.
 */
class ShuffleBag(private val ids: List<String>, private val rng: Random = Random.Default) {
    private var bag = mutableListOf<String>()
    private var last: String? = null

    fun next(): String {
        if (bag.isEmpty()) refill()
        return bag.removeAt(bag.lastIndex).also { last = it }
    }

    private fun refill() {
        bag = ids.toMutableList()
        for (i in bag.indices.reversed()) {
            if (i == 0) break
            val j = rng.nextInt(i + 1)
            val tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp
        }
        val top = bag.lastIndex
        if (bag.size > 1 && bag[top] == last) {
            val tmp = bag[top]; bag[top] = bag[0]; bag[0] = tmp
        }
    }
}
