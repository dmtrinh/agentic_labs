import { create } from 'zustand'
import type { MessageDto, SessionDto } from '../types'
import { chatApi } from '../services/api'

interface ChatState {
  sessions: SessionDto[]
  currentSessionId: string | null
  messages: MessageDto[]
  streamingContent: string
  isLoading: boolean
  currentAgentId: string

  setSessions: (sessions: SessionDto[]) => void
  setCurrentSession: (id: string | null) => void
  loadSession: (id: string) => Promise<void>
  addMessage: (msg: MessageDto) => void
  appendStreamToken: (token: string) => void
  finalizeStream: () => void
  setLoading: (loading: boolean) => void
  setAgentId: (id: string) => void
}

export const useChatStore = create<ChatState>((set, _get) => ({
  sessions: [],
  currentSessionId: null,
  messages: [],
  streamingContent: '',
  isLoading: false,
  currentAgentId: 'default',

  setSessions: sessions => set({ sessions }),
  setCurrentSession: id => set({ currentSessionId: id }),

  loadSession: async id => {
    set({ isLoading: true })
    try {
      const messages = await chatApi.getSession(id)
      set({ messages, currentSessionId: id, streamingContent: '' })
    } finally {
      set({ isLoading: false })
    }
  },

  addMessage: msg => {
    set(state => ({
      messages: [...state.messages, msg],
      streamingContent: ''
    }))
  },

  appendStreamToken: token =>
    set(state => ({ streamingContent: state.streamingContent + token })),

  finalizeStream: () =>
    set(state => {
      if (!state.streamingContent) return {}
      const streamMsg: MessageDto = {
        id: Date.now(),
        sessionId: state.currentSessionId ?? '',
        role: 'assistant',
        content: state.streamingContent,
        createdAt: new Date().toISOString()
      }
      return { messages: [...state.messages, streamMsg], streamingContent: '' }
    }),

  setLoading: isLoading => set({ isLoading }),
  setAgentId: id => set({ currentAgentId: id })
}))
