package com.agenticlabs.scheduler

import jakarta.persistence.*
import java.time.Instant

enum class JobType { CRON, INTERVAL, ONCE }

@Entity
@Table(name = "scheduled_jobs")
data class ScheduledJob(
    @Id val id: String,
    val name: String,
    val description: String = "",

    @Enumerated(EnumType.STRING)
    val jobType: JobType,

    val schedule: String,       // cron expression, interval in seconds, or ISO datetime
    val prompt: String,         // The prompt/task to run
    val agentId: String = "default",

    var enabled: Boolean = true,
    var lastRunAt: Instant? = null,
    var nextRunAt: Instant? = null,

    val createdAt: Instant = Instant.now()
)

data class CreateJobRequest(
    val name: String,
    val description: String = "",
    val jobType: JobType,
    val schedule: String,
    val prompt: String,
    val agentId: String = "default"
)
