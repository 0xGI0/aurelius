package io.github.oxgi0.stoa.net

import io.github.oxgi0.stoa.prefs.SecretsStore
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

@Serializable data class RegisterBody(val email: String, val password1: String, val password2: String)
@Serializable data class LoginBody(val email: String, val password: String)
@Serializable data class KeyBody(val key: String)
@Serializable data class EmailBody(val email: String)
@Serializable data class DetailResponse(val detail: String = "")
@Serializable data class TokenResponse(val key: String)
@Serializable data class FavoriteDto(
    @SerialName("quote_id") val quoteId: String,
    @SerialName("created_at") val createdAt: String,
)

/** Vertrag = README von aurelius-backend. */
interface BackendApi {
    @POST("api/auth/registration/")
    suspend fun register(@Body body: RegisterBody): DetailResponse

    @POST("api/auth/registration/verify-email/")
    suspend fun verifyEmail(@Body body: KeyBody): DetailResponse

    @POST("api/auth/login/")
    suspend fun login(@Body body: LoginBody): TokenResponse

    @POST("api/auth/logout/")
    suspend fun logout(): DetailResponse

    @POST("api/auth/password/reset/")
    suspend fun passwordReset(@Body body: EmailBody): DetailResponse

    @GET("api/favorites/")
    suspend fun favorites(): List<FavoriteDto>

    @PUT("api/favorites/{id}/")
    suspend fun putFavorite(@Path("id") id: String): FavoriteDto

    @DELETE("api/favorites/{id}/")
    suspend fun deleteFavorite(@Path("id") id: String): Response<Unit>
}

object BackendApiFactory {
    fun create(baseUrl: String, secrets: SecretsStore): BackendApi {
        val client = OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = secrets.token
                val request = if (token != null) {
                    chain.request().newBuilder().header("Authorization", "Token $token").build()
                } else {
                    chain.request()
                }
                chain.proceed(request)
            }
            .build()
        val json = Json { ignoreUnknownKeys = true }
        return Retrofit.Builder()
            .baseUrl(baseUrl.trimEnd('/') + "/")
            .client(client)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(BackendApi::class.java)
    }
}
