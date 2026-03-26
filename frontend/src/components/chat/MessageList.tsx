import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { Bot, User } from 'lucide-react'
import type { MessageDto } from '../../types'

interface Props {
  messages: MessageDto[]
  streamingContent?: string
}

function MessageBubble({ msg }: { msg: MessageDto }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
        isUser ? 'bg-brand-600' : 'bg-gray-700'
      }`}>
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-gray-300" />}
      </div>
      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
        isUser
          ? 'bg-brand-600 text-white rounded-tr-sm'
          : 'bg-gray-800 text-gray-100 rounded-tl-sm'
      }`}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default function MessageList({ messages, streamingContent = '' }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingContent])

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
      {messages.length === 0 && !streamingContent && (
        <div className="h-full flex flex-col items-center justify-center text-gray-600 gap-3">
          <Bot className="w-12 h-12" />
          <p className="text-lg font-medium">How can I help you today?</p>
          <p className="text-sm">Start a conversation with your AI agent</p>
        </div>
      )}

      {messages.map(msg => (
        <MessageBubble key={msg.id} msg={msg} />
      ))}

      {streamingContent && (
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-700 flex items-center justify-center">
            <Bot className="w-4 h-4 text-gray-300" />
          </div>
          <div className="max-w-[75%] rounded-2xl rounded-tl-sm px-4 py-3 text-sm bg-gray-800 text-gray-100">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{streamingContent}</ReactMarkdown>
            </div>
            <span className="inline-block w-1.5 h-4 bg-brand-500 animate-pulse ml-1 align-middle" />
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
