package com.agenticlabs.channels

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class ChannelStatus(
    val name: String,
    val running: Boolean,
    val type: String = "",
    val enabled: Boolean = false,
    val description: String = ""
)

data class UpdateChannelRequest(
    val config: Map<String, Any> = emptyMap()
)

@RestController
@RequestMapping("/api/channels")
class ChannelController(private val channelService: ChannelService) {

    @GetMapping
    fun list(): ResponseEntity<Map<String, ChannelStatus>> {
        val statuses = channelService.getAllStatuses()
        return ResponseEntity.ok(statuses.associateBy { it.name })
    }

    @GetMapping("/{name}")
    fun get(@PathVariable name: String): ResponseEntity<Any> {
        val status = channelService.getStatus(name) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(status)
    }

    @PutMapping("/{name}")
    fun update(
        @PathVariable name: String,
        @RequestBody req: UpdateChannelRequest
    ): ResponseEntity<Any> {
        channelService.updateConfig(name, req.config)
        return ResponseEntity.ok(mapOf("status" to "updated"))
    }

    @PostMapping("/{name}/start")
    fun start(@PathVariable name: String): ResponseEntity<Any> {
        channelService.start(name)
        return ResponseEntity.ok(mapOf("status" to "started"))
    }

    @PostMapping("/{name}/stop")
    fun stop(@PathVariable name: String): ResponseEntity<Any> {
        channelService.stop(name)
        return ResponseEntity.ok(mapOf("status" to "stopped"))
    }
}
