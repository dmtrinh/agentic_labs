package com.agenticlabs.chat

import com.agenticlabs.chat.model.ChatMessage
import com.agenticlabs.chat.model.ChatSession
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface ChatSessionRepository : JpaRepository<ChatSession, String>

interface ChatMessageRepository : JpaRepository<ChatMessage, Long> {
    fun findBySessionIdOrderByCreatedAt(sessionId: String): List<ChatMessage>
    fun deleteBySessionId(sessionId: String)
    fun countBySessionId(sessionId: String): Long

    @Query("SELECT m FROM ChatMessage m WHERE m.sessionId = :sessionId ORDER BY m.createdAt DESC LIMIT 1")
    fun findLastMessageBySessionId(sessionId: String): ChatMessage?
}
