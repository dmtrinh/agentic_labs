package com.agenticlabs.agent

import com.agenticlabs.chat.ChatMessageRepository
import com.agenticlabs.chat.ChatSessionRepository
import com.agenticlabs.chat.model.ChatMessage
import com.agenticlabs.chat.model.MessageRole
import com.agenticlabs.tasks.TaskService
import com.agenticlabs.tasks.TaskStatus
import com.agenticlabs.websocket.WebSocketEventPublisher
import org.slf4j.LoggerFactory
import org.springframework.ai.chat.client.ChatClient
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

/**
 * Orchestrates agent execution using Spring AI's ChatClient.
 * Uses Embabel's ChatAgent when the full planning pipeline is needed,
 * and Spring AI ChatClient for direct streaming/simple calls.
 */
@Service
class AgentOrchestrator(
    private val chatClient: ChatClient,
    private val messageRepo: ChatMessageRepository,
    private val sessionRepo: ChatSessionRepository,
    private val taskService: TaskService,
    private val wsPublisher: WebSocketEventPublisher
) {

    private val log = LoggerFactory.getLogger(javaClass)

    private val agents: List<AgentDefinition> = listOf(
        AgentDefinition(
            id = "default",
            name = "Assistant",
            description = "General-purpose AI assistant",
            model = "gpt-4o",
            instructions = "You are a helpful AI assistant. Answer concisely and accurately.",
            tools = listOf("web_search", "shell", "file_read")
        ),
        AgentDefinition(
            id = "researcher",
            name = "Researcher",
            description = "Web research and information synthesis agent",
            model = "gpt-4o",
            instructions = "You are a research specialist. Find and synthesize information from multiple sources.",
            tools = listOf("web_search", "web_browse")
        ),
        AgentDefinition(
            id = "coder",
            name = "Coder",
            description = "Software development and code review agent",
            model = "gpt-4o",
            instructions = "You are an expert programmer. Write clean, well-tested code.",
            tools = listOf("shell", "file_read", "file_write")
        )
    )

    fun getAgents(): List<AgentDefinition> = agents

    fun getAgent(id: String): AgentDefinition? = agents.find { it.id == id }

    @Async
    @Transactional
    fun processAsync(sessionId: String, agentId: String, userMessage: String, taskId: String) {
        try {
            taskService.updateStatus(taskId, TaskStatus.RUNNING)
            wsPublisher.publishTaskStatus(taskId, TaskStatus.RUNNING)

            val agent = agents.find { it.id == agentId } ?: agents.first()

            // Build conversation history for context window
            val history = messageRepo.findBySessionIdOrderByCreatedAt(sessionId)
                .takeLast(20) // keep last 20 messages for context
                .joinToString("\n") { msg ->
                    "${msg.role.name.lowercase()}: ${msg.content}"
                }

            // Build system prompt from agent instructions
            val systemPrompt = agent.instructions.ifBlank {
                "You are a helpful AI assistant."
            }

            // Stream response via Spring AI ChatClient
            val responseBuilder = StringBuilder()

            chatClient.prompt()
                .system(systemPrompt)
                .user { u ->
                    if (history.isNotBlank()) {
                        u.text("""
                            Previous conversation:
                            $history
                            ---
                            User: $userMessage
                        """.trimIndent())
                    } else {
                        u.text(userMessage)
                    }
                }
                .stream()
                .chatResponse()
                .toStream()
                .forEach { chunk ->
                    val token = chunk.result?.output?.text ?: ""
                    if (token.isNotEmpty()) {
                        responseBuilder.append(token)
                        wsPublisher.publishStreamToken(sessionId, token, taskId)
                    }
                }

            val fullResponse = responseBuilder.toString()

            // Save assistant response
            val assistantMsg = messageRepo.save(
                ChatMessage(
                    sessionId = sessionId,
                    agentId = agentId,
                    role = MessageRole.ASSISTANT,
                    content = fullResponse,
                    createdAt = Instant.now()
                )
            )

            // Update session timestamp
            sessionRepo.findById(sessionId).ifPresent { session ->
                sessionRepo.save(session.copy(updatedAt = Instant.now()))
            }

            taskService.updateStatus(taskId, TaskStatus.DONE)
            wsPublisher.publishMessage(sessionId, assistantMsg.let { msg ->
                com.agenticlabs.chat.model.MessageDto(
                    id = msg.id,
                    sessionId = msg.sessionId,
                    role = msg.role.name.lowercase(),
                    content = msg.content,
                    mediaUrl = msg.mediaUrl,
                    createdAt = msg.createdAt
                )
            })
            wsPublisher.publishTaskStatus(taskId, TaskStatus.DONE)

        } catch (e: Exception) {
            log.error("Agent processing failed for session $sessionId", e)
            taskService.updateStatus(taskId, TaskStatus.ERROR)
            wsPublisher.publishTaskStatus(taskId, TaskStatus.ERROR)
            wsPublisher.publishError(sessionId, e.message ?: "Agent error")
        }
    }
}
