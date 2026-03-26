package com.agenticlabs.credentials

import org.springframework.data.jpa.repository.JpaRepository

interface CredentialRepository : JpaRepository<Credential, String>
