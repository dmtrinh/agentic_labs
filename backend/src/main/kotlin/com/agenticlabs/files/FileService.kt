package com.agenticlabs.files

import com.agenticlabs.config.AppProperties
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import kotlin.io.path.*

data class FileEntry(
    val name: String,
    val path: String,
    val type: String,   // "file" or "directory"
    val size: Long = 0,
    val modifiedAt: Long = 0
)

@Service
class FileService(private val props: AppProperties) {

    private val workspaceRoot: Path = Paths.get(props.workspace.path).toAbsolutePath().normalize()

    private fun safePath(relativePath: String): Path {
        val resolved = workspaceRoot.resolve(relativePath).normalize()
        require(resolved.startsWith(workspaceRoot)) { "Path traversal attempt denied" }
        return resolved
    }

    fun listFiles(subPath: String = ""): List<FileEntry> {
        val dir = safePath(subPath)
        if (!Files.exists(dir)) return emptyList()
        return Files.walk(dir)
            .filter { !it.name.startsWith(".") }
            .map { path ->
                FileEntry(
                    name = path.name,
                    path = workspaceRoot.relativize(path).toString(),
                    type = if (Files.isDirectory(path)) "directory" else "file",
                    size = if (Files.isRegularFile(path)) Files.size(path) else 0,
                    modifiedAt = Files.getLastModifiedTime(path).toMillis()
                )
            }
            .toList()
    }

    fun readFile(relativePath: String): String {
        val path = safePath(relativePath)
        require(Files.isRegularFile(path)) { "Not a file: $relativePath" }
        return path.readText()
    }

    fun createFile(relativePath: String, content: String = ""): FileEntry {
        val path = safePath(relativePath)
        Files.createDirectories(path.parent)
        path.writeText(content)
        return FileEntry(
            name = path.name,
            path = relativePath,
            type = "file",
            size = content.length.toLong()
        )
    }

    fun createDirectory(relativePath: String): FileEntry {
        val path = safePath(relativePath)
        Files.createDirectories(path)
        return FileEntry(name = path.name, path = relativePath, type = "directory")
    }

    fun updateFile(relativePath: String, content: String): FileEntry {
        val path = safePath(relativePath)
        require(Files.isRegularFile(path)) { "File not found: $relativePath" }
        path.writeText(content)
        return FileEntry(
            name = path.name,
            path = relativePath,
            type = "file",
            size = content.length.toLong()
        )
    }

    fun deleteFile(relativePath: String) {
        val path = safePath(relativePath)
        if (Files.isDirectory(path)) {
            Files.walk(path).sorted(Comparator.reverseOrder()).forEach { Files.delete(it) }
        } else {
            Files.deleteIfExists(path)
        }
    }

    fun uploadFile(relativePath: String, file: MultipartFile): FileEntry {
        val path = safePath(relativePath).resolve(file.originalFilename ?: "upload")
        Files.createDirectories(path.parent)
        file.transferTo(path)
        return FileEntry(
            name = path.name,
            path = workspaceRoot.relativize(path).toString(),
            type = "file",
            size = file.size
        )
    }

    fun getAbsolutePath(relativePath: String): Path = safePath(relativePath)
}
