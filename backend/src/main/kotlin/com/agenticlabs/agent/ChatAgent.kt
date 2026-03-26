package com.agenticlabs.agent

import com.embabel.agent.api.annotation.Action
import com.embabel.agent.api.annotation.AchievesGoal
import com.embabel.agent.api.annotation.Agent
import com.embabel.agent.api.common.OperationContext
import com.embabel.agent.api.common.create
import com.embabel.agent.domain.io.UserInput

/**
 * Core chat agent using Embabel's goal-oriented action planning.
 * Handles multi-turn conversation with tool access.
 */
@Agent(description = "General-purpose AI assistant that answers questions and performs tasks")
class ChatAgent {

    data class ConversationContext(
        val userInput: UserInput,
        val sessionId: String,
        val history: String = ""
    )

    data class AgentResponse(
        val content: String,
        val toolsUsed: List<String> = emptyList()
    )

    @AchievesGoal(description = "Respond to user message with helpful, accurate information")
    @Action
    fun respond(context: ConversationContext, opContext: OperationContext): AgentResponse {
        val prompt = buildString {
            if (context.history.isNotBlank()) {
                appendLine("Previous conversation:")
                appendLine(context.history)
                appendLine("---")
            }
            appendLine("User: ${context.userInput.content}")
            appendLine()
            appendLine("Provide a helpful, accurate, and concise response.")
        }

        val responseText = opContext.ai()
            .withDefaultLlm()
            .withId("chat-respond-${context.sessionId}")
            .generateText(prompt)

        return AgentResponse(content = responseText)
    }
}
