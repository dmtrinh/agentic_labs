import org.jetbrains.kotlin.gradle.tasks.KotlinCompile

plugins {
    id("org.springframework.boot") version "3.3.5"
    id("io.spring.dependency-management") version "1.1.6"
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.spring") version "2.1.20"
    kotlin("plugin.jpa") version "2.1.20"
}

group = "com.agenticlabs"
version = "0.1.0"
java.sourceCompatibility = JavaVersion.VERSION_21

val springAiVersion = "1.1.1"
val embabelVersion = "0.3.4"

repositories {
    mavenCentral()
    maven { url = uri("https://repo.spring.io/milestone") }
    maven { url = uri("https://repo.spring.io/snapshot") }
}

dependencies {
    // Spring Boot core
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.springframework.boot:spring-boot-starter-websocket")
    implementation("org.springframework.boot:spring-boot-starter-security")
    implementation("org.springframework.boot:spring-boot-starter-data-jpa")
    implementation("org.springframework.boot:spring-boot-starter-validation")
    implementation("org.springframework.boot:spring-boot-starter-actuator")

    // Kotlin
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-reactor")

    // Spring WebFlux — required by Spring AI's WebClient-based HTTP layer.
    // We keep spring-boot-starter-web (Tomcat/MVC); adding spring-webflux only
    // brings in WebClient without switching the server to Netty.
    implementation("org.springframework:spring-webflux")
    implementation("io.projectreactor.netty:reactor-netty-http")

    // Spring AI — use platform BOM so all spring-ai artifacts get consistent versions
    // Artifact names changed in 1.0.0 GA (old *-spring-boot-starter names only exist up to M6)
    implementation(platform("org.springframework.ai:spring-ai-bom:$springAiVersion"))
    implementation("org.springframework.ai:spring-ai-starter-model-openai")
    implementation("org.springframework.ai:spring-ai-starter-model-anthropic")

    // Embabel agent framework — API only (annotations: @Agent, @Action, @AchievesGoal).
    // The full starter auto-configuration conflicts with Spring AI 1.0.0 model discovery;
    // actual agent execution is handled by AgentOrchestrator via Spring AI ChatClient directly.
    implementation("com.embabel.agent:embabel-agent-api:$embabelVersion")

    // JWT
    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    // Database
    runtimeOnly("com.h2database:h2")
    runtimeOnly("org.postgresql:postgresql")

    // Quartz scheduler
    implementation("org.springframework.boot:spring-boot-starter-quartz")

    // Test
    testImplementation("org.springframework.boot:spring-boot-starter-test")
    testImplementation("org.springframework.security:spring-security-test")
    testImplementation("com.embabel.agent:embabel-agent-test:$embabelVersion")
}

// Kill any process holding the server port before starting, so H2 file lock is always free
tasks.register("killPort") {
    doLast {
        val port = project.findProperty("server.port") ?: "8080"
        exec {
            commandLine("sh", "-c", "lsof -ti :$port | xargs kill -9 2>/dev/null || true")
        }
    }
}
tasks.bootRun { dependsOn("killPort") }

// Load .env file (one directory up from backend/) into bootRun environment
tasks.bootRun {
    val envFile = rootProject.file("../.env")
    if (envFile.exists()) {
        envFile.readLines()
            .filter { line -> line.isNotBlank() && !line.startsWith("#") && "=" in line }
            .forEach { line ->
                val (key, value) = line.split("=", limit = 2)
                environment(key.trim(), value.trim())
            }
    }
}

tasks.withType<KotlinCompile> {
    kotlinOptions {
        freeCompilerArgs = listOf("-Xjsr305=strict")
        jvmTarget = "21"
    }
}

tasks.withType<Test> {
    useJUnitPlatform()
}
