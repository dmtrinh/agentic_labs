package com.agenticlabs.tools

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/tools")
class ToolController(private val toolService: ToolService) {

    @GetMapping("/")
    fun listTools() = ResponseEntity.ok(toolService.listTools())

    @GetMapping("/{name}")
    fun getTool(@PathVariable name: String): ResponseEntity<Any> {
        val tool = toolService.getTool(name) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(tool)
    }
}
