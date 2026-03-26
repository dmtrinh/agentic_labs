package com.agenticlabs.tasks

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class TaskService(private val taskRepo: TaskRepository) {

    fun createTask(title: String, agentId: String = "default", sessionId: String? = null): Task {
        val task = Task(
            id = UUID.randomUUID().toString(),
            title = title,
            agentId = agentId,
            sessionId = sessionId
        )
        return taskRepo.save(task)
    }

    fun getTasks(): List<Task> {
        // Filter stale tasks >24h old (matching Agentic Labs behaviour)
        val cutoff = Instant.now().minusSeconds(86400)
        return taskRepo.findRecentTasks(cutoff)
    }

    fun getTask(id: String): Task? = taskRepo.findById(id).orElse(null)

    fun updateStatus(id: String, status: TaskStatus): Task? {
        val task = taskRepo.findById(id).orElse(null) ?: return null
        task.status = status
        task.updatedAt = Instant.now()
        return taskRepo.save(task)
    }

    fun updateTask(id: String, title: String? = null, status: TaskStatus? = null): Task? {
        val task = taskRepo.findById(id).orElse(null) ?: return null
        if (title != null) task.title.also { }
        if (status != null) task.status = status
        task.updatedAt = Instant.now()
        return taskRepo.save(task)
    }
}
