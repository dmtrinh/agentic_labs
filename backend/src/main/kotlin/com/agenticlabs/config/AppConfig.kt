package com.agenticlabs.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration
import java.nio.file.Files
import java.nio.file.Paths

@ConfigurationProperties(prefix = "app")
data class AppProperties(
    val jwt: JwtProperties = JwtProperties(),
    val workspace: WorkspaceProperties = WorkspaceProperties(),
    val skills: SkillsProperties = SkillsProperties(),
    val admin: AdminProperties = AdminProperties()
)

data class JwtProperties(
    val secret: String = "agenticlabs-default-secret-change-in-production",
    val expirationMs: Long = 86400000
)

data class WorkspaceProperties(
    val path: String = "./workspace"
)

data class SkillsProperties(
    val path: String = "./skills"
)

data class AdminProperties(
    val password: String = "admin"
)

@Configuration
@EnableConfigurationProperties(AppProperties::class)
class AppConfig(private val props: AppProperties) {

    init {
        // Ensure directories exist
        listOf(props.workspace.path, props.skills.path).forEach { path ->
            Files.createDirectories(Paths.get(path))
        }
    }
}
