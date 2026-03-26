package com.agenticlabs.tools

import org.springframework.stereotype.Service

data class ToolParameter(
    val name: String,
    val type: String,
    val description: String,
    val required: Boolean = false
)

data class ToolDefinition(
    val name: String,
    val description: String,
    val category: String,
    val parameters: List<ToolParameter> = emptyList(),
    val enabled: Boolean = true
)

@Service
class ToolService {

    private val tools = listOf(
        ToolDefinition(
            name = "web_search",
            description = "Search the web for information using a search engine",
            category = "web",
            parameters = listOf(
                ToolParameter("query", "string", "Search query", required = true),
                ToolParameter("limit", "integer", "Maximum number of results", required = false)
            )
        ),
        ToolDefinition(
            name = "web_browse",
            description = "Browse a URL and extract its content",
            category = "web",
            parameters = listOf(
                ToolParameter("url", "string", "URL to browse", required = true)
            )
        ),
        ToolDefinition(
            name = "shell",
            description = "Execute a shell command in the workspace",
            category = "system",
            parameters = listOf(
                ToolParameter("command", "string", "Shell command to execute", required = true),
                ToolParameter("timeout", "integer", "Timeout in seconds", required = false)
            )
        ),
        ToolDefinition(
            name = "file_read",
            description = "Read the contents of a file",
            category = "files",
            parameters = listOf(
                ToolParameter("path", "string", "File path relative to workspace", required = true)
            )
        ),
        ToolDefinition(
            name = "file_write",
            description = "Write content to a file",
            category = "files",
            parameters = listOf(
                ToolParameter("path", "string", "File path relative to workspace", required = true),
                ToolParameter("content", "string", "Content to write", required = true)
            )
        ),
        ToolDefinition(
            name = "file_list",
            description = "List files in a directory",
            category = "files",
            parameters = listOf(
                ToolParameter("path", "string", "Directory path relative to workspace", required = false)
            )
        ),
        ToolDefinition(
            name = "http_request",
            description = "Make an HTTP request to an external API",
            category = "web",
            parameters = listOf(
                ToolParameter("url", "string", "Request URL", required = true),
                ToolParameter("method", "string", "HTTP method (GET, POST, PUT, DELETE)", required = false),
                ToolParameter("headers", "object", "Request headers", required = false),
                ToolParameter("body", "string", "Request body", required = false)
            )
        ),
        ToolDefinition(
            name = "image_generate",
            description = "Generate an image from a text prompt",
            category = "ai",
            parameters = listOf(
                ToolParameter("prompt", "string", "Image generation prompt", required = true),
                ToolParameter("size", "string", "Image size (e.g. 1024x1024)", required = false)
            )
        )
    )

    fun listTools(): List<ToolDefinition> = tools

    fun getTool(name: String): ToolDefinition? = tools.find { it.name == name }
}
