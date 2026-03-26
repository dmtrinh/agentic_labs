package com.agenticlabs.skills

import com.agenticlabs.config.AppProperties
import org.springframework.stereotype.Service
import java.nio.file.Files
import java.nio.file.Paths
import kotlin.io.path.name
import kotlin.io.path.readText
import kotlin.io.path.writeText

enum class SkillTier { BUILTIN, PROJECT, WORKSPACE }

data class Skill(
    val name: String,
    val content: String,
    val tier: SkillTier,
    val description: String = ""
)

@Service
class SkillService(private val props: AppProperties) {

    private val skillsDir get() = Paths.get(props.skills.path)

    private val builtinSkills: List<Skill> = listOf(
        Skill(
            name = "web_search",
            tier = SkillTier.BUILTIN,
            description = "Search the web for information",
            content = """
                # Web Search Skill
                Use this skill to search the web for current information.

                ## Usage
                Search for: <query>

                ## Guidelines
                - Be specific with search queries
                - Summarize findings clearly
                - Cite sources when possible
            """.trimIndent()
        ),
        Skill(
            name = "code_review",
            tier = SkillTier.BUILTIN,
            description = "Review code for quality, bugs, and improvements",
            content = """
                # Code Review Skill
                Review code systematically for quality and correctness.

                ## Checklist
                - Correctness: Does the code do what it's supposed to?
                - Security: Are there any vulnerabilities?
                - Performance: Are there bottlenecks?
                - Readability: Is the code clear and well-documented?
            """.trimIndent()
        ),
        Skill(
            name = "summarize",
            tier = SkillTier.BUILTIN,
            description = "Summarize long documents or conversations",
            content = """
                # Summarize Skill
                Create concise summaries of long content.

                ## Format
                - Key Points: Bullet list of main ideas
                - Summary: 2-3 sentence overview
                - Action Items: Next steps if applicable
            """.trimIndent()
        )
    )

    fun listSkills(): List<Skill> {
        val workspaceSkills = if (Files.exists(skillsDir)) {
            Files.list(skillsDir)
                .filter { it.name.endsWith(".md") }
                .map { path ->
                    Skill(
                        name = path.name.removeSuffix(".md"),
                        content = path.readText(),
                        tier = SkillTier.WORKSPACE
                    )
                }
                .toList()
        } else emptyList()

        return builtinSkills + workspaceSkills
    }

    fun getSkill(name: String): Skill? {
        // Check workspace first (supports nested names like "community/sql-expert")
        val workspacePath = skillsDir.resolve("$name.md")
        if (Files.exists(workspacePath)) {
            return Skill(name = name, content = workspacePath.readText(), tier = SkillTier.WORKSPACE)
        }
        return builtinSkills.find { it.name == name }
    }

    fun updateSkill(name: String, content: String): Skill {
        val path = skillsDir.resolve("$name.md")
        Files.createDirectories(path.parent) // create intermediate dirs for nested names
        path.writeText(content)
        return Skill(name = name, content = content, tier = SkillTier.WORKSPACE)
    }

    fun deleteSkill(name: String): Boolean {
        val path = skillsDir.resolve("$name.md")
        return if (Files.exists(path)) {
            Files.delete(path)
            true
        } else false
    }
}
