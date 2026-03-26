package com.agenticlabs.websocket

import com.agenticlabs.agent.AgentOrchestrator
import com.agenticlabs.chat.model.SendMessageRequest
import com.agenticlabs.tasks.TaskService
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.Payload
import org.springframework.stereotype.Controller

data class WsIncomingMessage(
    val type: String = "chat",
    val sessionId: String? = null,
    val agentId: String = "default",
    val content: String = ""
)

@Controller
class WebSocketController(
    private val agentOrchestrator: AgentOrchestrator,
    private val taskService: TaskService,
    private val wsPublisher: WebSocketEventPublisher
) {

    @MessageMapping("/chat")
    fun handleChatMessage(@Payload msg: WsIncomingMessage) {
        val sessionId = msg.sessionId ?: java.util.UUID.randomUUID().toString()
        val task = taskService.createTask(
            title = msg.content.take(80),
            agentId = msg.agentId,
            sessionId = sessionId
        )
        agentOrchestrator.processAsync(sessionId, msg.agentId, msg.content, task.id)
    }
}
