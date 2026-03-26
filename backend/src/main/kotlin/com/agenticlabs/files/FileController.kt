package com.agenticlabs.files

import org.springframework.core.io.FileSystemResource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile

data class CreateFileRequest(val content: String = "")
data class UpdateFileRequest(val content: String)

@RestController
@RequestMapping("/api/files")
class FileController(private val fileService: FileService) {

    @GetMapping("/")
    fun listFiles(@RequestParam(defaultValue = "") path: String) =
        ResponseEntity.ok(fileService.listFiles(path))

    @GetMapping("/{path:.+}")
    fun readFile(@PathVariable path: String) =
        ResponseEntity.ok(mapOf("content" to fileService.readFile(path)))

    @GetMapping("/download/{path:.+}")
    fun downloadFile(@PathVariable path: String): ResponseEntity<FileSystemResource> {
        val file = fileService.getAbsolutePath(path).toFile()
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"${file.name}\"")
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(FileSystemResource(file))
    }

    @PostMapping("/create/{path:.+}")
    fun createFile(
        @PathVariable path: String,
        @RequestBody(required = false) req: CreateFileRequest?
    ) = ResponseEntity.ok(fileService.createFile(path, req?.content ?: ""))

    @PostMapping("/mkdir/{path:.+}")
    fun createDirectory(@PathVariable path: String) =
        ResponseEntity.ok(fileService.createDirectory(path))

    @PostMapping("/upload/{path:.+}")
    fun uploadFile(
        @PathVariable path: String,
        @RequestParam("file") file: MultipartFile
    ) = ResponseEntity.ok(fileService.uploadFile(path, file))

    @PutMapping("/{path:.+}")
    fun updateFile(
        @PathVariable path: String,
        @RequestBody req: UpdateFileRequest
    ) = ResponseEntity.ok(fileService.updateFile(path, req.content))

    @DeleteMapping("/{path:.+}")
    fun deleteFile(@PathVariable path: String): ResponseEntity<Unit> {
        fileService.deleteFile(path)
        return ResponseEntity.noContent().build()
    }
}
