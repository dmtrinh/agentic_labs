package com.agenticlabs.chat

import com.agenticlabs.agent.AgentOrchestrator
import com.agenticlabs.chat.model.*
import com.agenticlabs.tasks.Task
import com.agenticlabs.tasks.TaskService
import com.agenticlabs.tasks.TaskStatus
import com.agenticlabs.websocket.WebSocketEventPublisher
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class ChatService(
    private val sessionRepo: ChatSessionRepository,
    private val messageRepo: ChatMessageRepository,
    private val agentOrchestrator: AgentOrchestrator,
    private val taskService: TaskService,
    private val wsPublisher: WebSocketEventPublisher
) {

    fun sendMessage(req: SendMessageRequest): MessageDto {
        val sessionId = req.sessionId ?: UUID.randomUUID().toString()

        // Ensure session exists
        if (!sessionRepo.existsById(sessionId)) {
            sessionRepo.save(ChatSession(id = sessionId, agentId = req.agentId))
        } else {
            sessionRepo.findById(sessionId).ifPresent { session ->
                sessionRepo.save(session.copy(updatedAt = Instant.now()))
            }
        }

        // Save user message
        val userMsg = messageRepo.save(
            ChatMessage(
                sessionId = sessionId,
                agentId = req.agentId,
                role = MessageRole.USER,
                content = req.message
            )
        )

        // Create task for this interaction
        val task = taskService.createTask(
            title = req.message.take(80),
            agentId = req.agentId,
            sessionId = sessionId
        )

        // Publish user message event
        wsPublisher.publishMessage(sessionId, userMsg.toDto())
        wsPublisher.publishTaskUpdate(task)

        // Process asynchronously via agent
        agentOrchestrator.processAsync(sessionId, req.agentId, req.message, task.id)

        return userMsg.toDto()
    }

    fun getSessions(): List<SessionDto> =
        sessionRepo.findAll().map { session ->
            val count = messageRepo.countBySessionId(session.id)
            val last = messageRepo.findLastMessageBySessionId(session.id)
            SessionDto(
                id = session.id,
                agentId = session.agentId,
                createdAt = session.createdAt,
                updatedAt = session.updatedAt,
                messageCount = count.toInt(),
                lastMessage = last?.content?.take(100)
            )
        }

    fun getSession(sessionId: String): List<MessageDto> =
        messageRepo.findBySessionIdOrderByCreatedAt(sessionId).map { it.toDto() }

    fun deleteSession(sessionId: String) {
        messageRepo.deleteBySessionId(sessionId)
        sessionRepo.deleteById(sessionId)
    }

    private fun ChatMessage.toDto() = MessageDto(
        id = id,
        sessionId = sessionId,
        role = role.name.lowercase(),
        content = content,
        mediaUrl = mediaUrl,
        createdAt = createdAt
    )
}
