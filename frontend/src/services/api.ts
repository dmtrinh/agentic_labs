import axios from 'axios'
import type {
  LoginRequest, LoginResponse,
  AgentDefinition,
  SendMessageRequest, MessageDto, SessionDto,
  Task, TaskStatus,
  Skill,
  FileEntry,
  ScheduledJob, CreateJobRequest,
  ToolDefinition,
  Credential, CreateCredentialRequest,
  Provider,
  ChannelStatus,
  MarketplaceTarget
} from '../types'

const api = axios.create({ baseURL: '/api' })

// Attach JWT automatically
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Redirect on 401
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// --- Auth ---
export const authApi = {
  login: (req: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', req).then(r => r.data)
}

// --- Agents ---
export const agentsApi = {
  list: () => api.get<AgentDefinition[]>('/agents/').then(r => r.data)
}

// --- Chat ---
export const chatApi = {
  sendMessage: (req: SendMessageRequest) =>
    api.post<MessageDto>('/chat/', req).then(r => r.data),
  getSessions: () => api.get<SessionDto[]>('/chat/sessions').then(r => r.data),
  getSession: (id: string) =>
    api.get<MessageDto[]>(`/chat/sessions/${id}`).then(r => r.data),
  deleteSession: (id: string) => api.delete(`/chat/sessions/${id}`)
}

// --- Tasks ---
export const tasksApi = {
  list: () => api.get<Task[]>('/tasks').then(r => r.data),
  get: (id: string) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  patch: (id: string, status: TaskStatus) =>
    api.patch<Task>(`/tasks/${id}`, { status }).then(r => r.data)
}

// --- Skills ---
export const skillsApi = {
  list: () => api.get<Skill[]>('/skills/').then(r => r.data),
  get: (name: string) => api.get<Skill>(`/skills/${name}`).then(r => r.data),
  update: (name: string, content: string) =>
    api.put<Skill>(`/skills/${name}`, { content }).then(r => r.data),
  delete: (name: string) => api.delete(`/skills/${name}`)
}

// --- Files ---
export const filesApi = {
  list: (path = '') =>
    api.get<FileEntry[]>('/files/', { params: { path } }).then(r => r.data),
  read: (path: string) =>
    api.get<{ content: string }>(`/files/${path}`).then(r => r.data.content),
  create: (path: string, content = '') =>
    api.post<FileEntry>(`/files/create/${path}`, { content }).then(r => r.data),
  mkdir: (path: string) =>
    api.post<FileEntry>(`/files/mkdir/${path}`).then(r => r.data),
  update: (path: string, content: string) =>
    api.put<FileEntry>(`/files/${path}`, { content }).then(r => r.data),
  delete: (path: string) => api.delete(`/files/${path}`),
  downloadUrl: (path: string) => `/api/files/download/${path}`
}

// --- Scheduler ---
export const schedulerApi = {
  listJobs: () => api.get<ScheduledJob[]>('/scheduler/jobs').then(r => r.data),
  createJob: (req: CreateJobRequest) =>
    api.post<ScheduledJob>('/scheduler/jobs', req).then(r => r.data),
  deleteJob: (id: string) => api.delete(`/scheduler/jobs/${id}`)
}

// --- Tools ---
export const toolsApi = {
  list: () => api.get<ToolDefinition[]>('/tools/').then(r => r.data)
}

// --- System ---
export const systemApi = {
  health: () => api.get('/system/health').then(r => r.data),
  version: () => api.get('/system/version').then(r => r.data),
  info: () => api.get('/system/info').then(r => r.data)
}

// --- Credentials ---
export const credentialsApi = {
  list: () => api.get<Credential[]>('/credentials').then(r => r.data),
  get: (name: string) => api.get<Credential>(`/credentials/${name}`).then(r => r.data),
  create: (req: CreateCredentialRequest) =>
    api.post<Credential>('/credentials', req).then(r => r.data),
  update: (name: string, req: Partial<CreateCredentialRequest>) =>
    api.put<Credential>(`/credentials/${name}`, req).then(r => r.data),
  delete: (name: string) => api.delete(`/credentials/${name}`)
}

// --- Providers ---
export const providersApi = {
  list: () => api.get<Provider[]>('/providers').then(r => r.data),
  update: (name: string, data: { credential?: string; baseUrl?: string }) =>
    api.put(`/providers/${name}`, data).then(r => r.data)
}

// --- Channels ---
export const channelsApi = {
  list: () => api.get<Record<string, ChannelStatus>>('/channels').then(r => r.data),
  get: (name: string) => api.get<ChannelStatus>(`/channels/${name}`).then(r => r.data),
  update: (name: string, config: Record<string, unknown>) =>
    api.put(`/channels/${name}`, { config }).then(r => r.data),
  start: (name: string) => api.post(`/channels/${name}/start`).then(r => r.data),
  stop: (name: string) => api.post(`/channels/${name}/stop`).then(r => r.data)
}

// --- Marketplace ---
export const marketplaceApi = {
  targets: () => api.get<MarketplaceTarget[]>('/marketplace/targets').then(r => r.data),
  check: (source: string, name: string, agent?: string) =>
    api.get<{ installed: boolean }>(`/marketplace/check/${source}/${name}`, {
      params: agent !== undefined ? { agent } : {}
    }).then(r => r.data),
  install: (source: string, name: string, agent = '') =>
    api.post('/marketplace/install', { source, name, agent }).then(r => r.data)
}

// --- Config ---
export const configApi = {
  get: () => api.get('/config').then(r => r.data),
  getYaml: () => api.get<{ yaml: string }>('/config/yaml').then(r => r.data),
  validate: (yaml: string) =>
    api.post<{ valid: boolean; error?: string; line?: number }>('/config/validate', { yaml }).then(r => r.data),
  patch: (sections: Record<string, unknown>) =>
    api.patch('/config', { sections }).then(r => r.data),
  updateSection: (section: string, data: Record<string, unknown>) =>
    api.put(`/config/${section}`, { data }).then(r => r.data),
  restart: () => api.post('/config/restart').then(r => r.data)
}

export default api
