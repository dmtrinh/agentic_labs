package com.agenticlabs.providers

import com.agenticlabs.credentials.CredentialService
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class ProviderDto(
    val name: String,
    val configured: Boolean,
    val credential: String,
    val hasKey: Boolean,
    val baseUrl: String,
    val models: List<String>
)

data class UpdateProviderRequest(
    val credential: String = "",
    val baseUrl: String = ""
)

@RestController
@RequestMapping("/api/providers")
class ProviderController(
    private val credentialService: CredentialService
) {

    @Value("\${spring.ai.openai.api-key:not-configured}")
    private lateinit var openaiKey: String

    @Value("\${spring.ai.anthropic.api-key:not-configured}")
    private lateinit var anthropicKey: String

    private val providerCredentials = mutableMapOf<String, String>()

    @GetMapping
    fun list(): ResponseEntity<List<ProviderDto>> {
        val providers = listOf(
            buildProvider(
                name = "openai",
                envKey = openaiKey,
                defaultModels = listOf("gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "o1", "o3-mini")
            ),
            buildProvider(
                name = "anthropic",
                envKey = anthropicKey,
                defaultModels = listOf(
                    "claude-opus-4-6",
                    "claude-sonnet-4-6",
                    "claude-haiku-4-5-20251001",
                    "claude-3-5-sonnet-20241022"
                )
            ),
            buildProvider(
                name = "google",
                envKey = System.getenv("GOOGLE_API_KEY") ?: "not-configured",
                defaultModels = listOf("gemini-2.0-flash", "gemini-2.0-pro", "gemini-1.5-flash")
            ),
            buildProvider(
                name = "ollama",
                envKey = "configured", // local, no key needed
                defaultModels = listOf("llama3.3", "mistral", "codellama", "phi4")
            )
        )
        return ResponseEntity.ok(providers)
    }

    @PutMapping("/{name}")
    fun update(
        @PathVariable name: String,
        @RequestBody req: UpdateProviderRequest
    ): ResponseEntity<Any> {
        if (req.credential.isNotBlank()) {
            providerCredentials[name] = req.credential
        }
        return ResponseEntity.ok(mapOf("status" to "updated", "provider" to name))
    }

    private fun buildProvider(name: String, envKey: String, defaultModels: List<String>): ProviderDto {
        val credName = providerCredentials[name] ?: ""
        val credHasKey = credName.isNotBlank() && credentialService.getKey(credName) != null
        val envConfigured = envKey != "not-configured" && envKey.isNotBlank()
        return ProviderDto(
            name = name,
            configured = envConfigured || credHasKey,
            credential = credName,
            hasKey = envConfigured || credHasKey,
            baseUrl = when (name) {
                "ollama" -> "http://localhost:11434"
                else -> ""
            },
            models = defaultModels
        )
    }
}
