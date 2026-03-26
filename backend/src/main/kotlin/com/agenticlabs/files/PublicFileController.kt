package com.agenticlabs.files

import com.agenticlabs.config.AppProperties
import org.springframework.core.io.FileSystemResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URLConnection
import java.nio.file.Files
import java.nio.file.Paths

/**
 * Serves files from the public/ directory without authentication.
 * This allows media files (images, video, audio) to be embedded in HTML5 tags
 * without needing auth headers.
 */
@RestController
@RequestMapping("/public")
class PublicFileController(private val props: AppProperties) {

    private val workspaceRoot = Paths.get(props.workspace.path).toAbsolutePath().normalize()

    @GetMapping("/**")
    fun servePublicFile(
        @RequestAttribute(value = "javax.servlet.forward.request_uri", required = false) forwardUri: String?,
        request: jakarta.servlet.http.HttpServletRequest
    ): ResponseEntity<Resource> {
        // Extract the path after /public/
        val requestUri = request.requestURI
        val relativePath = requestUri.removePrefix("/public/").trimStart('/')

        // Safety check — no path traversal
        val filePath = workspaceRoot.resolve("public/$relativePath").normalize()
        if (!filePath.startsWith(workspaceRoot.resolve("public"))) {
            return ResponseEntity.status(403).build()
        }

        if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
            return ResponseEntity.notFound().build()
        }

        val resource = FileSystemResource(filePath)
        val contentType = URLConnection.guessContentTypeFromName(filePath.fileName.toString())
            ?: "application/octet-stream"

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
            .body(resource)
    }
}
