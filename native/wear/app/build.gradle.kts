plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
}

android {
  namespace = "com.quickcapture.wear"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.quickcapture.wear"
    minSdk = 30
    targetSdk = 35
    versionCode = 1
    versionName = "1.0.0"
  }

  buildTypes {
    release {
      isMinifyEnabled = false
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  buildFeatures {
    compose = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.15"
  }
}

dependencies {
  implementation(platform("androidx.compose:compose-bom:2024.12.01"))
  implementation("androidx.activity:activity-compose:1.9.3")
  implementation("androidx.compose.ui:ui")
  implementation("androidx.compose.ui:ui-tooling-preview")
  implementation("androidx.wear.compose:compose-material:1.4.1")
  implementation("androidx.wear.compose:compose-foundation:1.4.1")
  implementation("androidx.wear.tiles:tiles:1.4.1")
  implementation("androidx.wear.protolayout:protolayout:1.2.1")
  implementation("androidx.wear.protolayout:protolayout-material:1.2.1")
  implementation("com.google.android.gms:play-services-wearable:18.2.0")
  implementation("com.google.guava:guava:33.4.0-android")
  debugImplementation("androidx.compose.ui:ui-tooling")
}
