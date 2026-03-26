package com.agenticlabs.scheduler

import org.springframework.data.jpa.repository.JpaRepository

interface ScheduledJobRepository : JpaRepository<ScheduledJob, String> {
    fun findByEnabledTrue(): List<ScheduledJob>
}
