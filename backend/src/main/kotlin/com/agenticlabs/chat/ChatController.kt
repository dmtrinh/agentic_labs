package com.agenticlabs.chat

import com.agenticlabs.chat.model.SendMessageRequest
import com.agenticlabs.config.AppProperties
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Paths
import java.time.LocalDate
import java.util.UUID

@RestController
@RequestMapping("/api/chat")
class ChatController(
    private val chatService: ChatService,
    private val props: AppProperties
) {

    @PostMapping("/")
    fun sendMessage(@RequestBody req: SendMessageRequest) =
        ResponseEntity.ok(chatService.sendMessage(req))

    @PostMapping("/upload")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, Any>> {
        val today = LocalDate.now()
        val relDir = "public/media/${today.year}/${today.monthValue.toString().padStart(2, '0')}/${today.dayOfMonth.toString().padStart(2, '0')}"
        val ext = file.originalFilename?.substringAfterLast('.', "bin") ?: "bin"
        val filename = "${UUID.randomUUID().toString().replace("-", "").take(16)}.$ext"

        val dir = Paths.get(props.workspace.path, relDir)
        Files.createDirectories(dir)
        val dest = dir.resolve(filename)
        file.transferTo(dest)

        val storagePath = "$relDir/$filename"
        return ResponseEntity.ok(mapOf("paths" to listOf(storagePath)))
    }

    @GetMapping("/sessions")
    fun getSessions() = ResponseEntity.ok(chatService.getSessions())

    @GetMapping("/sessions/{id}")
    fun getSession(@PathVariable id: String) = ResponseEntity.ok(chatService.getSession(id))

    @DeleteMapping("/sessions/{id}")
    fun deleteSession(@PathVariable id: String): ResponseEntity<Unit> {
        chatService.deleteSession(id)
        return ResponseEntity.noContent().build()
    }
}
