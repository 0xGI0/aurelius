plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.kotlin.serialization)
    alias(libs.plugins.ksp)
    alias(libs.plugins.room)
    alias(libs.plugins.cyclonedx)
}

// CycloneDX-SBOM über die Release-Laufzeitabhängigkeiten
tasks.cyclonedxBom {
    setIncludeConfigs(listOf("releaseRuntimeClasspath"))
    setOutputFormat("json")
    setOutputName("bom.cdx")
}

android {
    namespace = "io.github.oxgi0.aurelius"
    compileSdk = 36

    defaultConfig {
        applicationId = "io.github.oxgi0.aurelius"
        minSdk = 26
        targetSdk = 36
        versionCode = 4
        versionName = "0.3.0"
        buildConfigField("String", "EXPLAIN_URL", "\"https://aurelius-rust.vercel.app/api/explain\"")
    }

    // Signatur nur, wenn der lokale Schlüssel vorhanden ist (Env-Vars) —
    // F-Droid baut ohne und signiert selbst.
    val ksPath: String? = System.getenv("AURELIUS_KEYSTORE")
    val ksPass: String? = System.getenv("AURELIUS_KEYSTORE_PASS")
    if (ksPath != null && ksPass != null) {
        signingConfigs {
            create("release") {
                storeFile = file(ksPath)
                storePassword = ksPass
                keyAlias = "aurelius"
                keyPassword = ksPass
            }
        }
    }

    buildTypes {
        debug {
            buildConfigField("String", "BACKEND_URL", "\"http://10.0.2.2:8000\"")
        }
        release {
            isMinifyEnabled = false
            buildConfigField("String", "BACKEND_URL", "\"\"")
            if (ksPath != null && ksPass != null) {
                signingConfig = signingConfigs.getByName("release")
            }
        }
    }

    buildFeatures {
        compose = true
        buildConfig = true
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    // F-Droid: keine Google-Dependency-Metadaten ins APK
    dependenciesInfo {
        includeInApk = false
        includeInBundle = false
    }
}

room {
    schemaDirectory("$projectDir/schemas")
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    // TODO Task 11: durch eigene Vektor-Icons ersetzen oder R8 aktivieren (APK-Größe)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.datastore.preferences)
    implementation(libs.security.crypto)
    implementation(libs.room.runtime)
    implementation(libs.room.ktx)
    ksp(libs.room.compiler)
    implementation(libs.retrofit)
    implementation(libs.retrofit.kotlinx)
    implementation(libs.okhttp)

    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    testImplementation(libs.mockwebserver)
}
