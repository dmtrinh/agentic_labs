package com.agenticlabs.tasks

import jakarta.persistence.*
import java.time.Instant

enum class TaskStatus { TODO, RUNNING, DONE, ERROR }

@Entity
@Table(name = "tasks")
data class Task(
    @Id val id: String,
    val title: String,
    val agentId: String = "default",
    val sessionId: String? = null,

    @Enumerated(EnumType.STRING)
    var status: TaskStatus = TaskStatus.TODO,

    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
)
