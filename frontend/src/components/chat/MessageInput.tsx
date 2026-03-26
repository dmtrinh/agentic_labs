import { useState, useRef, KeyboardEvent } from 'react'
import { Send, Paperclip, Loader2 } from 'lucide-react'

interface Props {
  onSend: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
}

export default function MessageInput({ onSend, isLoading, disabled, placeholder }: Props) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || isLoading || disabled) return
    onSend(trimmed)
    setText('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = 'auto'
      ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
    }
  }

  return (
    <div className="px-4 py-3 border-t border-gray-800 bg-gray-950">
      <div className="flex items-end gap-2 bg-gray-800 rounded-2xl px-3 py-2 border border-gray-700 focus-within:border-brand-500 transition-colors">
        <button
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors flex-shrink-0 mb-1"
          title="Attach file"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          placeholder={placeholder ?? 'Message your agent... (Enter to send, Shift+Enter for newline)'}
          disabled={disabled}
          className="flex-1 bg-transparent text-gray-100 placeholder-gray-600 text-sm resize-none focus:outline-none min-h-[24px] max-h-40 py-1"
        />

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading || disabled}
          className="p-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0 mb-0.5"
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 text-white animate-spin" />
            : <Send className="w-4 h-4 text-white" />
          }
        </button>
      </div>
      <p className="text-xs text-gray-700 text-center mt-1">
        AI agents can make mistakes. Verify important information.
      </p>
    </div>
  )
}
