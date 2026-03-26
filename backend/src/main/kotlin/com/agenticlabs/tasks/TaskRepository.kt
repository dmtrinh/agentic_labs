package com.agenticlabs.tasks

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.Instant

interface TaskRepository : JpaRepository<Task, String> {
    @Query("SELECT t FROM Task t WHERE t.createdAt > :since ORDER BY t.createdAt DESC")
    fun findRecentTasks(since: Instant): List<Task>
}
