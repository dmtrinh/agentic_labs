package com.agenticlabs

import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource

@SpringBootTest
@TestPropertySource(properties = [
    "spring.ai.openai.api-key=test-key",
    "spring.ai.anthropic.api-key=test-key",
    "embabel.agent.default-llm=gpt-4o"
])
class AgenticLabsApplicationTests {

    @Test
    fun contextLoads() {
    }
}
