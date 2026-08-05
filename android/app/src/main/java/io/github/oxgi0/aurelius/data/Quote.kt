package io.github.oxgi0.aurelius.data

import kotlinx.serialization.Serializable

@Serializable
data class Quote(
    val id: String,
    val book: Int,
    val section: Int,
    val texts: Map<String, String>,
)

@Serializable
data class Topic(
    val id: String,
    val label: String,
    val quoteIds: List<String>,
)

/** Rohform der Encheiridion-Einträge (data/enchiridion.json). */
@Serializable
data class EnchEntry(
    val id: String,
    val chapter: Int,
    val texts: Map<String, String>,
)

enum class Author { Aurel, Epiktet }

fun authorOf(id: String): Author = if (id.startsWith("e-")) Author.Epiktet else Author.Aurel
