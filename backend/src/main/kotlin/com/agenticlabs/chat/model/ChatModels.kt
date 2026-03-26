package com.agenticlabs.chat.model

import jakarta.persistence.*
import java.time.Instant

enum class MessageRole { USER, ASSISTANT, SYSTEM, TOOL }

@Entity
@Table(name = "chat_sessions")
data class ChatSession(
    @Id val id: String,
    val agentId: String = "default",
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
)

@Entity
@Table(name = "chat_messages")
data class ChatMessage(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val sessionId: String,
    val agentId: String = "default",

    @Enumerated(EnumType.STRING)
    val role: MessageRole,

    @Column(columnDefinition = "TEXT")
    val content: String,

    val mediaUrl: String? = null,
    val mediaType: String? = null,

    val createdAt: Instant = Instant.now()
)

// DTOs
data class SendMessageRequest(
    val message: String,
    val sessionId: String? = null,
    val agentId: String = "default"
)

data class MessageDto(
    val id: Long,
    val sessionId: String,
    val role: String,
    val content: String,
    val mediaUrl: String? = null,
    val createdAt: Instant
)

data class SessionDto(
    val id: String,
    val agentId: String,
    val createdAt: Instant,
    val updatedAt: Instant,
    val messageCount: Int = 0,
    val lastMessage: String? = null
)
