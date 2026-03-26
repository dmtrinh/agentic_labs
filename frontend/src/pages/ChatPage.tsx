import { useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useChatStore } from '../stores/chatStore'
import { chatApi, agentsApi } from '../services/api'
import { wsService } from '../services/websocket'
import MessageList from '../components/chat/MessageList'
import MessageInput from '../components/chat/MessageInput'
import toast from 'react-hot-toast'
import { Plus, ChevronDown } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import type { WsEvent, StreamTokenEvent, MessageDto } from '../types'
import { v4 as uuidv4 } from '../utils/uuid'
import { useState } from 'react'

export default function ChatPage() {
  const { sessionId: paramSessionId } = useParams<{ sessionId?: string }>()
  const navigate = useNavigate()
  const {
    messages, streamingContent, isLoading,
    currentSessionId, currentAgentId,
    loadSession, setCurrentSession,
    addMessage, appendStreamToken, finalizeStream,
    setLoading, setAgentId
  } = useChatStore()

  const [agentOpen, setAgentOpen] = useState(false)

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: agentsApi.list
  })

  // Load session from URL param
  useEffect(() => {
    if (paramSessionId && paramSessionId !== currentSessionId) {
      loadSession(paramSessionId)
    }
  }, [paramSessionId, currentSessionId, loadSession])

  // Subscribe to WebSocket events for current session
  useEffect(() => {
    const sid = currentSessionId
    if (!sid) return

    const unsubMsg = wsService.subscribeToSession(sid, (event: WsEvent) => {
      if (event.type === 'message') {
        const msg = event.payload as MessageDto
        if (msg.role === 'assistant') {
          addMessage(msg)
          setLoading(false)
        }
      }
      if (event.type === 'error') {
        const p = event.payload as { message: string }
        toast.error(p.message)
        setLoading(false)
      }
    })

    const unsubStream = wsService.subscribeToSessionStream(sid, (event: WsEvent) => {
      if (event.type === 'stream_token') {
        const p = event.payload as StreamTokenEvent
        appendStreamToken(p.token)
      }
    })

    return () => {
      unsubMsg()
      unsubStream()
    }
  }, [currentSessionId, addMessage, appendStreamToken, setLoading])

  // Finalize stream when loading ends
  useEffect(() => {
    if (!isLoading && streamingContent) {
      finalizeStream()
    }
  }, [isLoading, streamingContent, finalizeStream])

  const handleSend = useCallback(async (text: string) => {
    let sid = currentSessionId
    if (!sid) {
      sid = uuidv4()
      setCurrentSession(sid)
      navigate(`/chat/${sid}`, { replace: true })
    }

    // Optimistically add user message
    addMessage({
      id: Date.now(),
      sessionId: sid,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString()
    })

    setLoading(true)
    try {
      await chatApi.sendMessage({ message: text, sessionId: sid, agentId: currentAgentId })
    } catch (err) {
      toast.error('Failed to send message')
      setLoading(false)
    }
  }, [currentSessionId, currentAgentId, addMessage, setLoading, setCurrentSession, navigate])

  const handleNewChat = () => {
    setCurrentSession(null)
    navigate('/chat')
  }

  const currentAgent = agents.find(a => a.id === currentAgentId) ?? agents[0]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleNewChat} className="btn-ghost px-2 py-1.5">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
          {/* Agent selector */}
          <div className="relative">
            <button
              onClick={() => setAgentOpen(!agentOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 transition-colors"
            >
              {currentAgent?.name ?? 'Select Agent'}
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {agentOpen && (
              <div className="absolute top-full left-0 mt-1 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-10 overflow-hidden">
                {agents.map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => { setAgentId(agent.id); setAgentOpen(false) }}
                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-700 transition-colors ${
                      agent.id === currentAgentId ? 'text-brand-400' : 'text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{agent.name}</div>
                    <div className="text-xs text-gray-500">{agent.description}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {currentSessionId && (
          <span className="text-xs text-gray-600 font-mono">{currentSessionId.slice(0, 8)}</span>
        )}
      </div>

      {/* Messages */}
      <MessageList messages={messages} streamingContent={streamingContent} />

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        isLoading={isLoading}
        placeholder={`Message ${currentAgent?.name ?? 'agent'}...`}
      />
    </div>
  )
}
