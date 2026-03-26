package com.agenticlabs.agent

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/agents")
class AgentController(private val orchestrator: AgentOrchestrator) {

    @GetMapping("/")
    fun listAgents() = ResponseEntity.ok(orchestrator.getAgents())

    @GetMapping("/{id}")
    fun getAgent(@PathVariable id: String): ResponseEntity<Any> {
        val agent = orchestrator.getAgent(id)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(agent)
    }
}
