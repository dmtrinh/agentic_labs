package com.agenticlabs.config

import org.springframework.boot.autoconfigure.quartz.SchedulerFactoryBeanCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class QuartzConfig {

    /**
     * Spring Boot auto-configures the Quartz Scheduler bean.
     * We only need to register the application context under a known key so that
     * AgentScheduledJob can retrieve Spring beans at job-execution time.
     */
    @Bean
    fun quartzApplicationContextCustomizer(): SchedulerFactoryBeanCustomizer =
        SchedulerFactoryBeanCustomizer { factory ->
            factory.setApplicationContextSchedulerContextKey("applicationContext")
            factory.setWaitForJobsToCompleteOnShutdown(true)
            factory.setOverwriteExistingJobs(false)
        }
}
