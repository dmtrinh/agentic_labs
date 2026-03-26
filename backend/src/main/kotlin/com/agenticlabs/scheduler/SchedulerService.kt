package com.agenticlabs.scheduler

import com.agenticlabs.agent.AgentOrchestrator
import com.agenticlabs.tasks.TaskService
import org.quartz.*
import org.quartz.impl.matchers.GroupMatcher
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant
import java.util.UUID

@Service
@Transactional
class SchedulerService(
    private val jobRepo: ScheduledJobRepository,
    private val quartzScheduler: Scheduler,
    private val agentOrchestrator: AgentOrchestrator,
    private val taskService: TaskService
) {

    private val log = LoggerFactory.getLogger(javaClass)

    fun listJobs(): List<ScheduledJob> = jobRepo.findAll()

    fun createJob(req: CreateJobRequest): ScheduledJob {
        val job = ScheduledJob(
            id = UUID.randomUUID().toString(),
            name = req.name,
            description = req.description,
            jobType = req.jobType,
            schedule = req.schedule,
            prompt = req.prompt,
            agentId = req.agentId,
            nextRunAt = computeNextRun(req.jobType, req.schedule)
        )
        val saved = jobRepo.save(job)
        scheduleWithQuartz(saved)
        return saved
    }

    fun deleteJob(id: String): Boolean {
        val job = jobRepo.findById(id).orElse(null) ?: return false
        unscheduleFromQuartz(id)
        jobRepo.deleteById(id)
        return true
    }

    private fun scheduleWithQuartz(job: ScheduledJob) {
        try {
            val jobDetail = JobBuilder.newJob(AgentScheduledJob::class.java)
                .withIdentity(job.id, "agent-jobs")
                .usingJobData("prompt", job.prompt)
                .usingJobData("agentId", job.agentId)
                .usingJobData("jobId", job.id)
                .build()

            val trigger: Trigger = when (job.jobType) {
                JobType.CRON -> TriggerBuilder.newTrigger()
                    .withIdentity(job.id, "agent-triggers")
                    .withSchedule(CronScheduleBuilder.cronSchedule(job.schedule))
                    .build()

                JobType.INTERVAL -> TriggerBuilder.newTrigger()
                    .withIdentity(job.id, "agent-triggers")
                    .withSchedule(
                        SimpleScheduleBuilder.simpleSchedule()
                            .withIntervalInSeconds(job.schedule.toLong().toInt())
                            .repeatForever()
                    )
                    .build()

                JobType.ONCE -> TriggerBuilder.newTrigger()
                    .withIdentity(job.id, "agent-triggers")
                    .startAt(java.util.Date.from(Instant.parse(job.schedule)))
                    .build()
            }

            quartzScheduler.scheduleJob(jobDetail, trigger)
        } catch (e: Exception) {
            log.error("Failed to schedule job ${job.id}", e)
        }
    }

    private fun unscheduleFromQuartz(jobId: String) {
        runCatching {
            quartzScheduler.deleteJob(JobKey.jobKey(jobId, "agent-jobs"))
        }
    }

    private fun computeNextRun(type: JobType, schedule: String): Instant? = when (type) {
        JobType.ONCE -> runCatching { Instant.parse(schedule) }.getOrNull()
        else -> null // Quartz manages this
    }
}

/**
 * Quartz job implementation that invokes the agent orchestrator.
 */
class AgentScheduledJob : Job {
    override fun execute(context: JobExecutionContext) {
        // Quartz jobs need Spring beans injected via scheduler context
        val applicationContext = context.scheduler.context["applicationContext"]
            as? org.springframework.context.ApplicationContext ?: return

        val orchestrator = applicationContext.getBean(AgentOrchestrator::class.java)
        val taskService = applicationContext.getBean(TaskService::class.java)

        val prompt = context.mergedJobDataMap.getString("prompt")
        val agentId = context.mergedJobDataMap.getString("agentId")
        val jobId = context.mergedJobDataMap.getString("jobId")

        val task = taskService.createTask(
            title = "Scheduled: ${prompt.take(60)}",
            agentId = agentId
        )

        orchestrator.processAsync(
            sessionId = "scheduled-$jobId",
            agentId = agentId,
            userMessage = prompt,
            taskId = task.id
        )
    }
}
