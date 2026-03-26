package com.agenticlabs.marketplace

import com.agenticlabs.agent.AgentOrchestrator
import com.agenticlabs.skills.SkillService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class MarketplaceTarget(val label: String, val value: String)
data class InstallRequest(val source: String, val name: String, val agent: String = "")
data class CheckResponse(val installed: Boolean)

@RestController
@RequestMapping("/api/marketplace")
class MarketplaceController(
    private val skillService: SkillService,
    private val orchestrator: AgentOrchestrator
) {

    @GetMapping("/targets")
    fun getTargets(): ResponseEntity<List<MarketplaceTarget>> {
        val targets = mutableListOf(MarketplaceTarget("Project", ""))
        orchestrator.getAgents().forEach { agent ->
            targets.add(MarketplaceTarget("Agent: ${agent.name}", agent.id))
        }
        return ResponseEntity.ok(targets)
    }

    @GetMapping("/check/{source}/{name}")
    fun checkInstalled(
        @PathVariable source: String,
        @PathVariable name: String,
        @RequestParam(required = false) agent: String?
    ): ResponseEntity<CheckResponse> {
        val skillName = "$source/$name"
        val existing = skillService.getSkill(skillName)
        return ResponseEntity.ok(CheckResponse(installed = existing != null))
    }

    @PostMapping("/install")
    fun install(@RequestBody req: InstallRequest): ResponseEntity<Any> {
        val skillName = "${req.source}/${req.name}"
        // Check if a bundled marketplace skill content is available
        val content = MARKETPLACE_SKILLS["${req.source}:${req.name}"]
            ?: return ResponseEntity.badRequest().body(
                mapOf("error" to "Skill '${req.name}' not found in marketplace source '${req.source}'")
            )

        skillService.updateSkill(skillName, content)
        return ResponseEntity.ok(mapOf("ok" to true))
    }

    companion object {
        // Built-in marketplace catalog — in production this would be fetched from a remote registry
        val MARKETPLACE_SKILLS = mapOf(
            "community:sql-expert" to """---
name: sql-expert
description: Expert SQL query writing and database optimization. Use when working with SQL queries, database design, query tuning, indexes, or data modeling.
---
# SQL Expert

You are an expert SQL developer. Write optimized, safe, and readable SQL queries.

## Guidelines
- Use indexes effectively — add `EXPLAIN` when diagnosing slow queries
- Avoid `SELECT *` — always name columns explicitly
- Use parameterized queries to prevent SQL injection
- Prefer CTEs over deeply nested subqueries for readability
- Add comments for complex joins or business logic

## Common Patterns
- Window functions: `ROW_NUMBER()`, `RANK()`, `LAG()`, `LEAD()`
- Conditional aggregation: `SUM(CASE WHEN ... THEN 1 ELSE 0 END)`
- Upsert: `INSERT ... ON CONFLICT DO UPDATE`
""",
            "community:creative-writer" to """---
name: creative-writer
description: Creative writing assistance — fiction, poetry, screenwriting, storytelling. Use when user wants help writing stories, poems, scripts, or creative content.
---
# Creative Writer

You are a creative writing assistant specializing in fiction, poetry, and storytelling.

## Styles
- **Fiction**: character-driven narrative, vivid world-building, show-don't-tell
- **Poetry**: free verse, rhyme, meter, imagery, metaphor
- **Screenwriting**: scene headings, action lines, dialogue format

## Approach
1. Match the user's requested tone and genre
2. Use sensory detail and specific imagery
3. Develop characters with distinct voices
4. Revise on request — offer alternatives freely
""",
            "community:data-analyst" to """---
name: data-analyst
description: Data analysis, statistics, pandas, matplotlib, and visualization. Use when analyzing datasets, creating charts, running statistical tests, or working with tabular data.
---
# Data Analyst

Analyze data, compute statistics, and create visualizations.

## Tools
- Python with pandas, numpy, matplotlib, seaborn
- Statistical tests: t-test, chi-squared, ANOVA, correlation

## Workflow
1. Load and inspect data (`df.head()`, `df.describe()`, `df.info()`)
2. Clean: handle nulls, fix types, remove duplicates
3. Explore: distributions, correlations, outliers
4. Visualize: choose chart type appropriate to the data
5. Summarize findings in plain language

## Chart Selection
- Distribution → histogram or box plot
- Comparison → bar chart
- Trend over time → line chart
- Correlation → scatter plot or heatmap
""",
            "community:devops-helper" to """---
name: devops-helper
description: Docker, Kubernetes, CI/CD, cloud infrastructure, and deployment assistance. Use when working with containers, pipelines, IaC, or cloud services.
---
# DevOps Helper

Help with infrastructure, containers, and deployment pipelines.

## Topics
- **Docker**: Dockerfile best practices, multi-stage builds, compose
- **Kubernetes**: deployments, services, ingress, helm charts
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins pipelines
- **Cloud**: AWS, GCP, Azure CLI patterns

## Best Practices
- Use specific image tags — avoid `latest` in production
- Set resource limits on containers
- Store secrets in vault/secret manager, not env files
- Use health checks and readiness probes
- Pin action versions in GitHub Actions with SHA
""",
            "community:security-auditor" to """---
name: security-auditor
description: Code security review, vulnerability assessment, OWASP Top 10, and secure coding practices. Use when reviewing code for security issues or hardening an application.
---
# Security Auditor

Review code for security vulnerabilities and suggest remediations.

## OWASP Top 10 Checklist
1. **Injection** — SQL, NoSQL, command injection
2. **Broken Auth** — weak passwords, token leakage, missing expiry
3. **Sensitive Data Exposure** — logging secrets, unencrypted storage
4. **XXE / SSRF** — external entity injection, server-side request forgery
5. **Broken Access Control** — missing authorization checks
6. **Security Misconfiguration** — default creds, verbose errors
7. **XSS** — unescaped user input in HTML
8. **Insecure Deserialization** — untrusted data deserialization
9. **Using Components with Known Vulnerabilities** — outdated deps
10. **Insufficient Logging** — missing audit trails

## Reporting Format
For each finding: severity (Critical/High/Medium/Low), location, impact, and remediation.
"""
        )
    }
}
