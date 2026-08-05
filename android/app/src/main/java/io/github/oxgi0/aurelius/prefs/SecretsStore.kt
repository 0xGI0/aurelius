package io.github.oxgi0.aurelius.prefs

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Sensible Werte (API-Keys, Auth-Token) — verschlüsselt via Android Keystore.
 * Interface, damit Tests eine In-Memory-Variante nutzen können.
 */
interface SecretsStore {
    var anthropicKey: String?
    var token: String?
    var email: String?
}

class EncryptedSecretsStore(context: Context) : SecretsStore {
    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "aurelius.secrets",
        MasterKey.Builder(context).setKeyScheme(MasterKey.KeyScheme.AES256_GCM).build(),
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM,
    )

    override var anthropicKey: String?
        get() = prefs.getString("aurelius.anthropicKey", null)?.takeIf { it.isNotBlank() }
        set(value) = put("aurelius.anthropicKey", value?.trim()?.takeIf { it.isNotEmpty() })

    override var token: String?
        get() = prefs.getString("aurelius.token", null)
        set(value) = put("aurelius.token", value)

    override var email: String?
        get() = prefs.getString("aurelius.email", null)
        set(value) = put("aurelius.email", value)

    private fun put(key: String, value: String?) {
        prefs.edit().apply { if (value == null) remove(key) else putString(key, value) }.apply()
    }
}

class InMemorySecretsStore : SecretsStore {
    override var anthropicKey: String? = null
    override var token: String? = null
    override var email: String? = null
}
