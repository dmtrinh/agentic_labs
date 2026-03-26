package com.agenticlabs.agent

import org.springframework.ai.chat.client.ChatClient
import org.springframework.ai.chat.model.ChatModel
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class ChatClientConfig {

    /**
     * Builds the default ChatClient from whichever ChatModel beans are present.
     * Both model starters are on the classpath, but a model bean is only created
     * when its API key is configured — so inject each as optional and pick the
     * first available one, preferring [app.default-model] when both exist.
     */
    @Bean
    fun chatClient(
        @Value("\${app.default-model:openai}") preference: String,
        @Autowired(required = false) @Qualifier("openAiChatModel") openAiModel: ChatModel?,
        @Autowired(required = false) @Qualifier("anthropicChatModel") anthropicModel: ChatModel?,
    ): ChatClient {
        val model: ChatModel = when {
            preference == "anthropic" && anthropicModel != null -> anthropicModel
            preference == "openai"    && openAiModel    != null -> openAiModel
            openAiModel    != null -> openAiModel      // fallback: whichever is present
            anthropicModel != null -> anthropicModel
            else -> error(
                "No ChatModel bean found. Set OPENAI_API_KEY or ANTHROPIC_API_KEY " +
                "and ensure the corresponding spring.ai.*.api-key property is populated."
            )
        }
        return ChatClient.builder(model).build()
    }
}
