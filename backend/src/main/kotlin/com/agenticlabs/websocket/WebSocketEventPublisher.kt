package com.agenticlabs.websocket

import com.agenticlabs.chat.model.MessageDto
import com.agenticlabs.tasks.Task
import com.agenticlabs.tasks.TaskStatus
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Component

data class WsEvent(
    val type: String,
    val payload: Any
)

data class StreamTokenEvent(
    val sessionId: String,
    val token: String,
    val taskId: String
)

@Component
class WebSocketEventPublisher(private val template: SimpMessagingTemplate) {

    fun publishMessage(sessionId: String, message: MessageDto) {
        template.convertAndSend(
            "/topic/sessions/$sessionId",
            WsEvent("message", message)
        )
        template.convertAndSend(
            "/topic/messages",
            WsEvent("message", message)
        )
    }

    fun publishStreamToken(sessionId: String, token: String, taskId: String) {
        template.convertAndSend(
            "/topic/sessions/$sessionId/stream",
            WsEvent("stream_token", StreamTokenEvent(sessionId, token, taskId))
        )
    }

    fun publishTaskUpdate(task: Task) {
        template.convertAndSend(
            "/topic/tasks",
            WsEvent("task_update", task)
        )
    }

    fun publishTaskStatus(taskId: String, status: TaskStatus) {
        template.convertAndSend(
            "/topic/tasks",
            WsEvent("task_status", mapOf("id" to taskId, "status" to status))
        )
    }

    fun publishError(sessionId: String, message: String) {
        template.convertAndSend(
            "/topic/sessions/$sessionId",
            WsEvent("error", mapOf("message" to message))
        )
    }
}
