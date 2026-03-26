package com.agenticlabs.channels

import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class ChannelService {

    // Track running state and config in memory
    private val runningState = ConcurrentHashMap<String, Boolean>()
    private val channelConfig = ConcurrentHashMap<String, MutableMap<String, Any>>()

    init {
        // Web channel is always running
        runningState["web"] = true
        runningState["telegram"] = false

        channelConfig["web"] = mutableMapOf("description" to "Built-in web chat interface")
        channelConfig["telegram"] = mutableMapOf(
            "description" to "Telegram bot integration",
            "credential" to "",
            "allowed_users" to emptyList<String>()
        )
    }

    fun getAllStatuses(): List<ChannelStatus> = listOf(
        getStatus("web")!!,
        getStatus("telegram")!!
    )

    fun getStatus(name: String): ChannelStatus? {
        return when (name) {
            "web" -> ChannelStatus(
                name = "web",
                running = runningState["web"] ?: true,
                type = "web",
                enabled = true,
                description = "Built-in web chat interface — always active"
            )
            "telegram" -> ChannelStatus(
                name = "telegram",
                running = runningState["telegram"] ?: false,
                type = "telegram",
                enabled = runningState["telegram"] ?: false,
                description = "Telegram bot channel. Requires a bot token credential."
            )
            else -> null
        }
    }

    fun updateConfig(name: String, config: Map<String, Any>) {
        channelConfig.getOrPut(name) { mutableMapOf() }.putAll(config)
    }

    fun start(name: String) {
        runningState[name] = true
    }

    fun stop(name: String) {
        if (name == "web") return // web channel cannot be stopped
        runningState[name] = false
    }

    fun getConfig(name: String): Map<String, Any> =
        channelConfig[name] ?: emptyMap()
}
