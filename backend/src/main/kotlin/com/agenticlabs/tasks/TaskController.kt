package com.agenticlabs.tasks

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class PatchTaskRequest(
    val title: String? = null,
    val status: TaskStatus? = null
)

@RestController
@RequestMapping("/api/tasks")
class TaskController(private val taskService: TaskService) {

    @GetMapping
    fun listTasks() = ResponseEntity.ok(taskService.getTasks())

    @GetMapping("/{id}")
    fun getTask(@PathVariable id: String): ResponseEntity<Any> {
        val task = taskService.getTask(id) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(task)
    }

    @PatchMapping("/{id}")
    fun patchTask(
        @PathVariable id: String,
        @RequestBody req: PatchTaskRequest
    ): ResponseEntity<Any> {
        val task = taskService.updateTask(id, req.title, req.status)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(task)
    }
}
