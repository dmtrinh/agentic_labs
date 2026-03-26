package com.agenticlabs.credentials

import jakarta.persistence.*
import java.time.Instant

@Entity
@Table(name = "credentials")
data class Credential(
    @Id val name: String,
    val type: String,         // "simple", "oauth", "bearer"
    val keyValue: String = "", // masked on read
    val username: String = "",
    val extra: String = "",   // JSON for additional fields
    val createdAt: Instant = Instant.now(),
    var updatedAt: Instant = Instant.now()
)
