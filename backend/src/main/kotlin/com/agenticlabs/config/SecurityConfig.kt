package com.agenticlabs.config

import com.agenticlabs.auth.JwtService
import jakarta.servlet.FilterChain
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.filter.OncePerRequestFilter

@Configuration
@EnableWebSecurity
class SecurityConfig(private val jwtService: JwtService) {

    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                auth
                    .requestMatchers(
                        "/api/auth/**",
                        "/ws/**",
                        "/public/**",
                        "/h2-console/**",
                        "/actuator/health",
                        "/actuator/info"
                    ).permitAll()
                    .anyRequest().authenticated()
            }
            .headers { it.frameOptions { fo -> fo.disable() } } // for H2 console
            .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter::class.java)

        return http.build()
    }

    @Bean
    fun jwtAuthFilter(): JwtAuthFilter = JwtAuthFilter(jwtService)
}

class JwtAuthFilter(private val jwtService: JwtService) : OncePerRequestFilter() {

    override fun doFilterInternal(
        request: HttpServletRequest,
        response: HttpServletResponse,
        chain: FilterChain
    ) {
        val authHeader = request.getHeader("Authorization")
        val token = when {
            authHeader != null && authHeader.startsWith("Bearer ") -> authHeader.substring(7)
            else -> request.getParameter("token") // allow ?token= for WS
        }

        if (token != null && SecurityContextHolder.getContext().authentication == null) {
            val username = jwtService.extractUsername(token)
            if (username != null && jwtService.isTokenValid(token, username)) {
                val auth = UsernamePasswordAuthenticationToken(username, null, emptyList())
                SecurityContextHolder.getContext().authentication = auth
            }
        }
        chain.doFilter(request, response)
    }
}
