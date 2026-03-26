package com.agenticlabs.agent

data class AgentDefinition(
    val id: String,
    val name: String,
    val description: String,
    val model: String,
    val instructions: String = "",
    val tools: List<String> = emptyList()
)

data class AgentListResponse(
    val agents: List<AgentDefinition>
)
