package com.agenticlabs.system

import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.lang.management.ManagementFactory

@RestController
@RequestMapping("/api/system")
class SystemController {

    @Value("\${spring.application.name:agenticlabs}")
    private lateinit var appName: String

    @GetMapping("/health")
    fun health() = ResponseEntity.ok(mapOf("status" to "ok", "app" to appName))

    @GetMapping("/version")
    fun version() = ResponseEntity.ok(
        mapOf(
            "version" to "0.1.0",
            "app" to appName,
            "springBoot" to "3.3.5",
            "springAi" to "1.0.0",
            "embabel" to "0.3.4"
        )
    )

    @GetMapping("/info")
    fun info(): ResponseEntity<Map<String, Any>> {
        val runtime = Runtime.getRuntime()
        val osBean = ManagementFactory.getOperatingSystemMXBean()
        val memBean = ManagementFactory.getMemoryMXBean()

        return ResponseEntity.ok(
            mapOf(
                "os" to mapOf(
                    "name" to System.getProperty("os.name"),
                    "version" to System.getProperty("os.version"),
                    "arch" to System.getProperty("os.arch"),
                    "cpuCount" to runtime.availableProcessors(),
                    "systemLoad" to osBean.systemLoadAverage
                ),
                "memory" to mapOf(
                    "heapUsedMb" to memBean.heapMemoryUsage.used / 1_048_576,
                    "heapMaxMb" to memBean.heapMemoryUsage.max / 1_048_576,
                    "totalMb" to runtime.totalMemory() / 1_048_576,
                    "freeMb" to runtime.freeMemory() / 1_048_576
                ),
                "java" to mapOf(
                    "version" to System.getProperty("java.version"),
                    "vendor" to System.getProperty("java.vendor")
                )
            )
        )
    }
}
