// ---- Auth ----
export interface LoginRequest { username: string; password: string }
export interface LoginResponse { token: string; username: string }

// ---- Agents ----
export interface AgentDefinition {
  id: string
  name: string
  description: string
  model: string
  instructions: string
  tools: string[]
}

// ---- Chat ----
export type MessageRole = 'user' | 'assistant' | 'system' | 'tool'

export interface MessageDto {
  id: number
  sessionId: string
  role: MessageRole
  content: string
  mediaUrl?: string
  createdAt: string
}

export interface SessionDto {
  id: string
  agentId: string
  createdAt: string
  updatedAt: string
  messageCount: number
  lastMessage?: string
}

export interface SendMessageRequest {
  message: string
  sessionId?: string
  agentId?: string
}

// ---- Tasks ----
export type TaskStatus = 'TODO' | 'RUNNING' | 'DONE' | 'ERROR'

export interface Task {
  id: string
  title: string
  agentId: string
  sessionId?: string
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

// ---- Skills ----
export type SkillTier = 'BUILTIN' | 'PROJECT' | 'WORKSPACE'

export interface Skill {
  name: string
  content: string
  tier: SkillTier
  description: string
}

// ---- Files ----
export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: number
}

// ---- Scheduler ----
export type JobType = 'CRON' | 'INTERVAL' | 'ONCE'

export interface ScheduledJob {
  id: string
  name: string
  description: string
  jobType: JobType
  schedule: string
  prompt: string
  agentId: string
  enabled: boolean
  lastRunAt?: string
  nextRunAt?: string
  createdAt: string
}

export interface CreateJobRequest {
  name: string
  description?: string
  jobType: JobType
  schedule: string
  prompt: string
  agentId?: string
}

// ---- Tools ----
export interface ToolParameter {
  name: string
  type: string
  description: string
  required: boolean
}

export interface ToolDefinition {
  name: string
  description: string
  category: string
  parameters: ToolParameter[]
  enabled: boolean
}

// ---- WebSocket ----
export interface WsEvent {
  type: 'message' | 'stream_token' | 'task_update' | 'task_status' | 'error'
  payload: unknown
}

export interface StreamTokenEvent {
  sessionId: string
  token: string
  taskId: string
}
