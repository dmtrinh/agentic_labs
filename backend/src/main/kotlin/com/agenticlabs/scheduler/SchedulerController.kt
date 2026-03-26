package com.agenticlabs.scheduler

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/scheduler")
class SchedulerController(private val schedulerService: SchedulerService) {

    @GetMapping("/jobs")
    fun listJobs() = ResponseEntity.ok(schedulerService.listJobs())

    @PostMapping("/jobs")
    fun createJob(@RequestBody req: CreateJobRequest) =
        ResponseEntity.ok(schedulerService.createJob(req))

    @DeleteMapping("/jobs/{id}")
    fun deleteJob(@PathVariable id: String): ResponseEntity<Unit> {
        schedulerService.deleteJob(id)
        return ResponseEntity.noContent().build()
    }
}
