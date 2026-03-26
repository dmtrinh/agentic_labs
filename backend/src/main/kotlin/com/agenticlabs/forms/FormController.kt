package com.agenticlabs.forms

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class FormField(
    val name: String,
    val type: String,
    val label: String,
    val required: Boolean = false,
    val placeholder: String = "",
    val options: List<Map<String, String>> = emptyList(),
    val visibleWhen: Map<String, String> = emptyMap()
)

@RestController
@RequestMapping("/api/forms")
class FormController {

    @GetMapping
    fun getForms(): ResponseEntity<Map<String, List<FormField>>> {
        return ResponseEntity.ok(
            mapOf(
                "credential_simple" to listOf(
                    FormField("name", "text", "Credential Name", required = true, placeholder = "anthropic"),
                    FormField("key", "secret", "API Key", required = true, placeholder = "sk-ant-...")
                ),
                "credential_login" to listOf(
                    FormField("name", "text", "Credential Name", required = true),
                    FormField("username", "text", "Username", required = true),
                    FormField("key", "secret", "Password", required = true)
                ),
                "credential_bearer" to listOf(
                    FormField("name", "text", "Credential Name", required = true),
                    FormField("key", "secret", "Bearer Token", required = true)
                ),
                "telegram_channel" to listOf(
                    FormField("credential", "credential", "Bot Token Credential", required = true),
                    FormField(
                        "allowed_users", "long-text", "Allowed Users",
                        placeholder = "One Telegram username or chat ID per line"
                    )
                ),
                "scheduler_job" to listOf(
                    FormField("name", "text", "Job Name", required = true),
                    FormField("description", "text", "Description"),
                    FormField(
                        "jobType", "select", "Schedule Type", required = true,
                        options = listOf(
                            mapOf("label" to "Cron Expression", "value" to "CRON"),
                            mapOf("label" to "Interval (seconds)", "value" to "INTERVAL"),
                            mapOf("label" to "One-time", "value" to "ONCE")
                        )
                    ),
                    FormField("schedule", "text", "Schedule", required = true, placeholder = "0 9 * * 1-5 or 3600"),
                    FormField("prompt", "long-text", "Message / Prompt", required = true),
                    FormField("agentId", "text", "Agent ID", placeholder = "default")
                ),
                "provider_config" to listOf(
                    FormField("credential", "credential", "Credential (API Key)"),
                    FormField("baseUrl", "text", "Base URL Override", placeholder = "https://api.openai.com/v1")
                ),
                "bot_settings" to listOf(
                    FormField("name", "text", "Bot Name", required = true),
                    FormField("description", "text", "Bot Description")
                )
            )
        )
    }
}
