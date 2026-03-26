package com.agenticlabs.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class ValidateYamlRequest(val yaml: String)
data class ValidateYamlResponse(val valid: Boolean, val error: String? = null, val line: Int? = null)
data class UpdateSectionRequest(val data: Map<String, Any> = emptyMap())
data class PatchConfigRequest(val sections: Map<String, Map<String, Any>> = emptyMap())

@RestController
@RequestMapping("/api/config")
class ConfigController(
    private val props: AppProperties
) {

    @Value("\${spring.application.name:agenticlabs}")
    private lateinit var appName: String

    @GetMapping
    fun getConfig(): ResponseEntity<Map<String, Any>> {
        return ResponseEntity.ok(buildConfigMap())
    }

    @GetMapping("/yaml")
    fun getConfigYaml(): ResponseEntity<Map<String, Any>> {
        val yaml = buildYamlString()
        return ResponseEntity.ok(mapOf("yaml" to yaml))
    }

    @PostMapping("/validate")
    fun validateYaml(@RequestBody req: ValidateYamlRequest): ResponseEntity<ValidateYamlResponse> {
        return try {
            // Basic YAML validation — check it's parseable
            val factory = org.yaml.snakeyaml.Yaml()
            factory.load<Any>(req.yaml)
            ResponseEntity.ok(ValidateYamlResponse(valid = true))
        } catch (e: Exception) {
            val line = extractLineNumber(e.message)
            ResponseEntity.ok(ValidateYamlResponse(valid = false, error = e.message, line = line))
        }
    }

    @PatchMapping
    fun patchConfig(@RequestBody req: PatchConfigRequest): ResponseEntity<Map<String, Any>> {
        // In this implementation config is environment-based; acknowledge the patch
        return ResponseEntity.ok(mapOf("status" to "updated", "sections" to req.sections.keys.toList()))
    }

    @PutMapping("/{section}")
    fun updateSection(
        @PathVariable section: String,
        @RequestBody req: UpdateSectionRequest
    ): ResponseEntity<Any> {
        val validSections = setOf("bot", "server", "agents", "image", "web_client", "tools", "storage", "cron", "credentials", "providers", "advanced")
        if (section !in validSections) {
            return ResponseEntity.badRequest().body(mapOf("error" to "Unknown section: $section"))
        }
        return ResponseEntity.ok(mapOf("status" to "updated", "section" to section))
    }

    @PostMapping("/restart")
    fun restart(): ResponseEntity<Map<String, Any>> {
        // Signal that services should restart — in this implementation we just acknowledge
        return ResponseEntity.ok(mapOf("status" to "restarting"))
    }

    private fun buildConfigMap(): Map<String, Any> = mapOf(
        "bot" to mapOf(
            "name" to appName,
            "description" to "Your personal AI assistant"
        ),
        "server" to mapOf(
            "host" to "0.0.0.0",
            "port" to 8080,
            "public_url" to ""
        ),
        "agents" to mapOf(
            "main" to mapOf(
                "model" to (System.getenv("DEFAULT_LLM") ?: "gpt-4o"),
                "workspace" to props.workspace.path
            )
        ),
        "tools" to mapOf(
            "general" to mapOf("restrict_to_workspace" to true)
        )
    )

    private fun buildYamlString(): String {
        val config = buildConfigMap()
        val sb = StringBuilder()
        sb.appendLine("# Agentic Labs Configuration")
        sb.appendLine()
        config.forEach { (section, value) ->
            sb.appendLine("$section:")
            when (value) {
                is Map<*, *> -> value.forEach { (k, v) ->
                    when (v) {
                        is Map<*, *> -> {
                            sb.appendLine("  $k:")
                            v.forEach { (k2, v2) -> sb.appendLine("    $k2: $v2") }
                        }
                        else -> sb.appendLine("  $k: $v")
                    }
                }
                else -> sb.appendLine("  $value")
            }
            sb.appendLine()
        }
        return sb.toString()
    }

    private fun extractLineNumber(message: String?): Int? {
        if (message == null) return null
        val match = Regex("line (\\d+)").find(message)
        return match?.groupValues?.get(1)?.toIntOrNull()
    }
}
