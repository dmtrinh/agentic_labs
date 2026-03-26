package com.agenticlabs.chat

import com.agenticlabs.chat.model.SendMessageRequest
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/chat")
class ChatController(private val chatService: ChatService) {

    @PostMapping("/")
    fun sendMessage(@RequestBody req: SendMessageRequest) =
        ResponseEntity.ok(chatService.sendMessage(req))

    @PostMapping("/upload")
    fun uploadFile(@RequestParam("file") file: MultipartFile): ResponseEntity<Map<String, String>> {
        // Simple stub — wire to FileService for full implementation
        return ResponseEntity.ok(mapOf("url" to "/api/files/${file.originalFilename}"))
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
