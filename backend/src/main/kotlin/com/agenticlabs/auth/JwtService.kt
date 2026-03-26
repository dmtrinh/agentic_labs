package com.agenticlabs.auth

import com.agenticlabs.config.AppProperties
import io.jsonwebtoken.Claims
import io.jsonwebtoken.Jwts
import io.jsonwebtoken.security.Keys
import org.springframework.stereotype.Service
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtService(private val props: AppProperties) {

    private val key: SecretKey by lazy {
        Keys.hmacShaKeyFor(props.jwt.secret.toByteArray())
    }

    fun generateToken(username: String): String {
        val now = Date()
        return Jwts.builder()
            .subject(username)
            .issuedAt(now)
            .expiration(Date(now.time + props.jwt.expirationMs))
            .signWith(key)
            .compact()
    }

    fun extractUsername(token: String): String? =
        runCatching { extractAllClaims(token).subject }.getOrNull()

    fun isTokenValid(token: String, username: String): Boolean =
        runCatching {
            extractUsername(token) == username && !isTokenExpired(token)
        }.getOrDefault(false)

    private fun isTokenExpired(token: String): Boolean =
        extractAllClaims(token).expiration.before(Date())

    private fun extractAllClaims(token: String): Claims =
        Jwts.parser().verifyWith(key).build().parseSignedClaims(token).payload
}
