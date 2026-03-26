package com.agenticlabs.credentials

import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

data class CredentialDto(
    val name: String,
    val type: String,
    val key: String,       // masked: "****" if set, "" if not
    val username: String,
    val extra: String
)

@Service
@Transactional
class CredentialService(private val repo: CredentialRepository) {

    fun list(): List<CredentialDto> =
        repo.findAll().map { it.toDto() }

    fun get(name: String): CredentialDto? =
        repo.findById(name).orElse(null)?.toDto()

    fun create(name: String, type: String, key: String, username: String = "", extra: String = ""): CredentialDto {
        val cred = Credential(name = name, type = type, keyValue = key, username = username, extra = extra)
        return repo.save(cred).toDto()
    }

    fun update(name: String, type: String, key: String, username: String = "", extra: String = ""): CredentialDto? {
        val existing = repo.findById(name).orElse(null) ?: return null
        val updated = existing.copy(
            type = type,
            keyValue = if (key.isNotBlank()) key else existing.keyValue,
            username = username,
            extra = extra,
            updatedAt = Instant.now()
        )
        return repo.save(updated).toDto()
    }

    fun delete(name: String) = repo.deleteById(name)

    fun getKey(name: String): String? =
        repo.findById(name).orElse(null)?.keyValue

    private fun Credential.toDto() = CredentialDto(
        name = name,
        type = type,
        key = if (keyValue.isNotBlank()) "****" else "",
        username = username,
        extra = extra
    )
}
