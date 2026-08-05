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
