package com.agenticlabs.credentials

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class CreateCredentialRequest(
    val name: String,
    val type: String,
    val key: String = "",
    val username: String = "",
    val extra: String = ""
)

data class UpdateCredentialRequest(
    val type: String,
    val key: String = "",
    val username: String = "",
    val extra: String = ""
)

@RestController
@RequestMapping("/api/credentials")
class CredentialController(private val service: CredentialService) {

    @GetMapping
    fun list() = ResponseEntity.ok(service.list())

    @GetMapping("/{name}")
    fun get(@PathVariable name: String): ResponseEntity<Any> {
        val cred = service.get(name) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(cred)
    }

    @PostMapping
    fun create(@RequestBody req: CreateCredentialRequest): ResponseEntity<Any> {
        val cred = service.create(req.name, req.type, req.key, req.username, req.extra)
        return ResponseEntity.ok(cred)
    }

    @PutMapping("/{name}")
    fun update(
        @PathVariable name: String,
        @RequestBody req: UpdateCredentialRequest
    ): ResponseEntity<Any> {
        val cred = service.update(name, req.type, req.key, req.username, req.extra)
            ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(cred)
    }

    @DeleteMapping("/{name}")
    fun delete(@PathVariable name: String): ResponseEntity<Any> {
        service.delete(name)
        return ResponseEntity.ok(mapOf("status" to "deleted"))
    }
}
