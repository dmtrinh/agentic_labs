package com.agenticlabs.auth

import com.agenticlabs.config.AppProperties
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

data class LoginRequest(
    @field:NotBlank val username: String,
    @field:NotBlank val password: String
)

data class LoginResponse(val token: String, val username: String)

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val jwtService: JwtService,
    private val props: AppProperties
) {

    @PostMapping("/login")
    fun login(@Valid @RequestBody req: LoginRequest): ResponseEntity<Any> {
        // Simple single-user auth matching Agentic Labs behaviour
        val validPassword = req.password == props.admin.password
        return if (validPassword) {
            val token = jwtService.generateToken(req.username)
            ResponseEntity.ok(LoginResponse(token, req.username))
        } else {
            ResponseEntity.status(401).body(mapOf("error" to "Invalid credentials"))
        }
    }
}
