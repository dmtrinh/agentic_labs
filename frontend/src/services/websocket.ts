import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import type { WsEvent } from '../types'

type EventHandler = (event: WsEvent) => void

class WebSocketService {
  private client: Client | null = null
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private subscriptions: Map<string, { unsubscribe: () => void }> = new Map()

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client = new Client({
        webSocketFactory: () => new SockJS('/ws'),
        connectHeaders: { Authorization: `Bearer ${token}` },
        reconnectDelay: 3000,
        onConnect: () => resolve(),
        onStompError: frame => reject(new Error(frame.headers.message))
      })
      this.client.activate()
    })
  }

  disconnect() {
    this.client?.deactivate()
    this.client = null
    this.subscriptions.clear()
    this.handlers.clear()
  }

  subscribe(topic: string, handler: EventHandler): () => void {
    if (!this.handlers.has(topic)) {
      this.handlers.set(topic, new Set())
    }
    this.handlers.get(topic)!.add(handler)

    if (!this.subscriptions.has(topic) && this.client?.connected) {
      const sub = this.client.subscribe(topic, msg => {
        const event: WsEvent = JSON.parse(msg.body)
        this.handlers.get(topic)?.forEach(h => h(event))
      })
      this.subscriptions.set(topic, sub)
    }

    return () => {
      this.handlers.get(topic)?.delete(handler)
      if (!this.handlers.get(topic)?.size) {
        this.subscriptions.get(topic)?.unsubscribe()
        this.subscriptions.delete(topic)
        this.handlers.delete(topic)
      }
    }
  }

  subscribeToSession(sessionId: string, handler: EventHandler) {
    return this.subscribe(`/topic/sessions/${sessionId}`, handler)
  }

  subscribeToSessionStream(sessionId: string, handler: EventHandler) {
    return this.subscribe(`/topic/sessions/${sessionId}/stream`, handler)
  }

  subscribeToTasks(handler: EventHandler) {
    return this.subscribe('/topic/tasks', handler)
  }

  sendChatMessage(sessionId: string, content: string, agentId: string = 'default') {
    this.client?.publish({
      destination: '/app/chat',
      body: JSON.stringify({ type: 'chat', sessionId, agentId, content })
    })
  }

  get connected() { return this.client?.connected ?? false }
}

export const wsService = new WebSocketService()
