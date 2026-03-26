package com.agenticlabs.skills

import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class UpdateSkillRequest(val content: String)

@RestController
@RequestMapping("/api/skills")
class SkillController(private val skillService: SkillService) {

    @GetMapping("/")
    fun listSkills() = ResponseEntity.ok(skillService.listSkills())

    @GetMapping("/{name}")
    fun getSkill(@PathVariable name: String): ResponseEntity<Any> {
        val skill = skillService.getSkill(name) ?: return ResponseEntity.notFound().build()
        return ResponseEntity.ok(skill)
    }

    @PutMapping("/{name}")
    fun updateSkill(
        @PathVariable name: String,
        @RequestBody req: UpdateSkillRequest
    ) = ResponseEntity.ok(skillService.updateSkill(name, req.content))

    @DeleteMapping("/{name}")
    fun deleteSkill(@PathVariable name: String): ResponseEntity<Unit> {
        skillService.deleteSkill(name)
        return ResponseEntity.noContent().build()
    }
}
