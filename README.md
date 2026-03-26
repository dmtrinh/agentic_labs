# Agentic Labs

Re-implementation of [OpenBotX](https://github.com/openbotx/openbotx) AI agent platform on a React 18 / Embabel / Spring AI / Spring Boot tech stack.

## Features

- **Multi-agent chat** — multiple specialized agents (Assistant, Researcher, Coder)
- **Real-time streaming** — token-by-token responses via STOMP WebSocket
- **Task board** — Kanban view of all agent tasks (TODO / RUNNING / DONE / ERROR)
- **Skills system** — Markdown-based agent skills with a community marketplace
- **File manager** — Workspace file browser with inline editing
- **Scheduler** — Cron, interval, and one-time scheduled agent jobs (Quartz)
- **Tools catalog** — Web search, shell, HTTP, file I/O tools
- **JWT auth** — Stateless authentication with 24h token expiry
- **System info** — CPU, memory, Java runtime stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Zustand, TanStack Query |
| Backend | Spring Boot 3.3, Kotlin, Spring AI 1.0 |
| AI Agents | Embabel Agent Framework 0.3.4 |
| Real-time | Spring WebSocket (STOMP) + SockJS |
| Database | H2 (embedded, persisted to disk) / PostgreSQL |
| Scheduler | Quartz |
| Auth | JWT (jjwt) |
| Container | Docker + nginx |

## Quick Start

### Prerequisites
- Java 21+
- Node.js 20+
- An API key for OpenAI or Anthropic

### 1. Configure environment

```bash
cp .env.example .env
# Edit .env and add your API key(s)
```

### 2. Start backend

```bash
cd backend
./gradlew bootRun
```

### 3. Start frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with username `admin` and the password from your `.env`.

### Docker (all-in-one)

```bash
docker compose up --build
```

Frontend at `http://localhost:3000`, backend at `http://localhost:8080`.

## Configuration

All settings are via environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key |
| `ANTHROPIC_API_KEY` | — | Anthropic API key |
| `DEFAULT_LLM` | `gpt-4o` | Default model |
| `ADMIN_PASSWORD` | `admin` | Login password |
| `JWT_SECRET` | (built-in) | JWT signing secret (change in prod!) |
| `WORKSPACE_PATH` | `./workspace` | Agent file workspace |
| `SKILLS_PATH` | `./skills` | Custom skills directory |

## API Reference

All endpoints are prefixed with `/api/`:

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/login` | Get JWT token |
| `GET` | `/agents/` | List agents |
| `POST` | `/chat/` | Send message |
| `GET` | `/chat/sessions` | List sessions |
| `GET` | `/chat/sessions/{id}` | Get session messages |
| `DELETE` | `/chat/sessions/{id}` | Delete session |
| `GET` | `/tasks` | List tasks (last 24h) |
| `PATCH` | `/tasks/{id}` | Update task status |
| `GET` | `/skills/` | List skills |
| `PUT` | `/skills/{name}` | Create/update skill |
| `DELETE` | `/skills/{name}` | Delete skill |
| `GET` | `/files/` | List workspace files |
| `POST` | `/files/create/{path}` | Create file |
| `PUT` | `/files/{path}` | Update file |
| `DELETE` | `/files/{path}` | Delete file |
| `GET` | `/scheduler/jobs` | List scheduled jobs |
| `POST` | `/scheduler/jobs` | Create job |
| `DELETE` | `/scheduler/jobs/{id}` | Delete job |
| `GET` | `/tools/` | List available tools |
| `GET` | `/system/health` | Health check |
| `GET` | `/system/info` | System stats |
| `WS` | `/ws` | STOMP WebSocket endpoint |

## Architecture

```
┌─────────────────────────────────────────┐
│             React Frontend              │
│  Zustand stores · TanStack Query        │
│  STOMP/SockJS WebSocket client          │
└───────────────┬─────────────────────────┘
                │ HTTP / WS
┌───────────────▼─────────────────────────┐
│          Spring Boot Backend            │
│                                         │
│  ┌─────────────┐   ┌─────────────────┐  │
│  │ REST API    │   │ STOMP WebSocket │  │
│  │ Controllers │   │   /topic/...    │  │
│  └──────┬──────┘   └────────┬────────┘  │
│         │                   │           │
│  ┌──────▼───────────────────▼───────┐   │
│  │      Agent Orchestrator          │   │
│  │  Spring AI ChatClient (streaming)│   │
│  │  Embabel ChatAgent (planning)    │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────┐ ┌─────────┐ ┌─────────┐  │
│  │ ChatSvc  │ │TaskSvc  │ │SkillSvc │  │
│  └──────────┘ └─────────┘ └─────────┘  │
│  ┌──────────┐ ┌─────────┐              │
│  │ FileSvc  │ │QuartzSvc│              │
│  └──────────┘ └─────────┘              │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │    H2 / PostgreSQL (JPA)        │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

## Project Structure

```
agentic-labs/
├── backend/                    # Spring Boot application
│   └── src/main/kotlin/com/openbotx/
│       ├── AgenticLabsApplication.kt
│       ├── config/             # Security, WebSocket, CORS, Quartz
│       ├── auth/               # JWT auth controller + service
│       ├── agent/              # Embabel agent + Spring AI orchestrator
│       ├── chat/               # Chat sessions + messages
│       ├── tasks/              # Task management
│       ├── skills/             # Skill CRUD
│       ├── files/              # Workspace file manager
│       ├── scheduler/          # Quartz job management
│       ├── tools/              # Tool catalog
│       ├── websocket/          # STOMP event publisher
│       └── system/             # Health + metrics endpoints
└── frontend/                   # React application
    └── src/
        ├── pages/              # 9 full-page views
        ├── components/         # Layout, Sidebar, chat UI
        ├── stores/             # Zustand state (auth, chat, tasks)
        ├── services/           # axios API client + WebSocket service
        └── types/              # TypeScript interfaces
```
