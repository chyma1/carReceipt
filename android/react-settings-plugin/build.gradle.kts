import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    kotlin("jvm") version "1.9.23"
    id("java-gradle-plugin")
}

repositories {
    mavenCentral()
}

gradlePlugin {
    plugins {
        create("reactSettingsPlugin") {
            id = "com.facebook.react.settings"
            implementationClass = "expo.plugins.ReactSettingsPlugin"
        }
    }
}

// Configure Kotlin compilation
kotlin {
    jvmToolchain(17)
}

// Configure source sets
sourceSets {
    main {
        kotlin {
            srcDirs = ["src/main/kotlin"]
        }
    }
}

// Ensure the Kotlin sources are properly recognized
tasks.withType<org.jetbrains.kotlin.gradle.tasks.KotlinCompile> {
    kotlinOptions {
        jvmTarget = "17"
    }
}
